from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os
import random

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions"

# Load existing journal entries if the file exists
def load_journal_entries():
    try:
        if os.path.exists("journal_entries.json"):
            with open("journal_entries.json", "r") as f:
                return json.load(f)
        return []
    except Exception as e:
        print(f"Error loading journal entries: {e}")
        return []

def analyze_sentiment(text):
    # Simple sentiment analysis (you can replace with your actual sentiment.py logic)
    positive_words = ["happy", "good", "great", "excellent", "joy", "love", "excited"]
    negative_words = ["sad", "bad", "terrible", "awful", "hate", "angry", "upset", "die"]
    
    text = text.lower()
    positive_count = sum(1 for word in positive_words if word in text)
    negative_count = sum(1 for word in negative_words if word in text)
    
    if positive_count > negative_count:
        return "Positive"
    elif negative_count > positive_count:
        return "Negative"
    else:
        return "Neutral"

def get_ai_response(entry, sentiment):
    #prompt = f"""
# You are a kind and emotionally intelligent journal buddy. The user has just shared a personal journal entry.

# Here is their entry:
# \"\"\"{entry}\"\"\"

# Their mood seems to be **{sentiment.lower()}**.

# Based on this mood, craft a response that feels human — like you're speaking directly to them. Your tone should be:
# - 🌧️ **Supportive and comforting** if the mood is negative.
# - 🌤️ **Reflective and encouraging** if the mood is neutral.
# - ☀️ **Affirming and celebratory** if the mood is positive.

# Your reply should:
# 1. Acknowledge their feelings with warmth and empathy. Begin with a friendly greeting like "Hi friend" or "Hey buddy."
# 2. Encourage or validate their experience.
# 3. Offer a simple suggestion or question to support their emotional well-being (especially if their mood is negative or neutral).
# 4. Be written in a friendly, conversational tone using first-person or second-person voice (like "I'm here" or "You've got this").
# 5. Be 4–5 sentences long — short but heartfelt.

# Avoid sounding robotic or like a generic summary. Speak like a compassionate friend who really cares.
# """
    prompt = f"""
You are a caring and emotionally intelligent journal buddy.

The user wrote:
\"\"\"{entry}\"\"\"

Their mood is: {sentiment.lower()}.

Based on this mood, craft a response that feels human — like you're speaking directly to them. Your tone should be:
-**Supportive and comforting** if the mood is negative.
-**Reflective and encouraging** if the mood is neutral.
-**Affirming and celebratory** if the mood is positive.

Write a thoughtful and compassionate response, around 5 sentences long. 
Write in a reflective, journal-style voice with gentle metaphors when appropriate.
Your reply should:
- Acknowledge their feelings and experiences
- Reflect on possible reasons behind their mood
- Offer gentle insights or helpful suggestions
- Ask a reflective or supportive question
- Use a warm, conversational tone (first- or second-person)

Be detailed and personal, like you're writing to a close friend who needs comfort and support. Avoid sounding robotic or overly formal.
"""    

    payload = {
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    try:
        print(f"Sending request to LM Studio at {LM_STUDIO_URL}")
        response = requests.post(LM_STUDIO_URL, json=payload)
        print(f"Response status: {response.status_code}")
        data = response.json()
        print(f"Response data: {data}")
        return data['choices'][0]['message']['content']
    except Exception as e:
        print(f"Error in get_ai_response: {e}")
        return f"Oops, something went wrong with the AI: {str(e)}"

def generate_suggested_actions(entry, sentiment):
    # Generate suggested actions based on the entry content and sentiment
    prompt = f"""
Based on the following journal entry and its sentiment, suggest 3 specific actions the user could take to improve their well-being.
Each suggestion should have a title and a brief description (1-2 sentences).

Journal entry: "{entry}"
Sentiment: {sentiment}

Format your response as a JSON array with the following structure:
[
  {{
    "title": "Action title",
    "description": "Brief description of the action",
    "icon": "one of: reflect, journey, personalized, meditate, connect, create, move, nature, gratitude, learn"
  }},
  ...
]

The icon field should be one of these values that best matches the action:
- reflect: for introspective activities
- journey: for progress-oriented activities
- personalized: for creative activities
- meditate: for mindfulness activities
- connect: for social activities
- create: for artistic activities
- move: for physical activities
- nature: for outdoor activities
- gratitude: for appreciation activities
- learn: for educational activities
"""

    payload = {
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    # Default suggestions in case the API call fails
    default_suggestions = [
        {
            "title": "Gratitude Journal",
            "description": "Write down three things you're grateful for to maintain this positive mood",
            "icon": "reflect"
        },
        {
            "title": "Share Your Joy",
            "description": "Consider reaching out to a friend or family member to share your positive feelings",
            "icon": "connect"
        },
        {
            "title": "Create a Happy Playlist",
            "description": "Compile songs that match or enhance your current positive mood",
            "icon": "create"
        }
    ]

    try:
        response = requests.post(LM_STUDIO_URL, json=payload)
        if response.ok:
            data = response.json()
            content = data['choices'][0]['message']['content']
            
            # Extract JSON from the response
            try:
                # Find JSON array in the response
                import re
                json_match = re.search(r'\[.*\]', content, re.DOTALL)
                if json_match:
                    suggestions = json.loads(json_match.group(0))
                    # Validate the structure
                    if isinstance(suggestions, list) and len(suggestions) > 0:
                        # Ensure we have at least 3 suggestions
                        while len(suggestions) < 3:
                            suggestions.append(random.choice(default_suggestions))
                        # Limit to 3 suggestions
                        return suggestions[:3]
                
                # If we couldn't parse JSON or it's invalid, use defaults
                return default_suggestions
            except Exception as e:
                print(f"Error parsing suggestions JSON: {e}")
                return default_suggestions
        else:
            return default_suggestions
    except Exception as e:
        print(f"Error generating suggestions: {e}")
        return default_suggestions

# Save journal entries to the file
def save_entry(entry, sentiment, ai_response, suggestions):
    log = {
        "entry": entry, 
        "sentiment": sentiment, 
        "response": ai_response,
        "suggestions": suggestions
    }
    
    # Load existing entries
    data = load_journal_entries()
    
    # Add new entry
    data.append(log)
    
    # Save all entries
    with open("journal_entries.json", "w") as f:
        json.dump(data, f, indent=4)

# Add a root route for testing
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "Flask backend is running",
        "endpoints": {
            "/api/journal": "POST - Process journal entries"
        }
    })

@app.route("/api/journal", methods=["POST"])
def process_journal():
    print("Received request to /api/journal")
    try:
        data = request.json
        print(f"Request data: {data}")
        
        entry = data.get("journalEntry", "").strip()
        
        if not entry:
            return jsonify({"error": "No journal entry provided", "success": False}), 400
        
        sentiment = analyze_sentiment(entry)
        print(f"Sentiment: {sentiment}")
        
        ai_response = get_ai_response(entry, sentiment)
        print(f"AI Response: {ai_response}")
        
        # Generate suggested actions
        suggestions = generate_suggested_actions(entry, sentiment)
        print(f"Suggested actions: {suggestions}")
        
        save_entry(entry, sentiment, ai_response, suggestions)
        
        return jsonify({
            "sentiment": sentiment,
            "response": ai_response,
            "suggestions": suggestions,
            "success": True
        })
    except Exception as e:
        print(f"Error in process_journal: {e}")
        return jsonify({
            "error": str(e),
            "success": False,
            "fallbackResponse": "I'm sorry, I couldn't process your journal entry at the moment. Please try again later."
        }), 500

if __name__ == "__main__":
    print("Starting Flask server on http://localhost:5000")
    app.run(debug=True, port=5000)
