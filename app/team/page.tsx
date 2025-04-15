/*
Author: Angelo Tiquio
Last Modified by: Angelo Tiquio
Date Last Modified: 2025-04-14
Program Description: This is the team page of the Sentimo app. It displays the team members with their images and social media links. The page has a gradient background and a section to join the team. The layout is responsive and adapts to different screen sizes.
Revision History:
    0.1 - 2025-04-14: Initial creation.  
*/
"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainNav } from "@/components/layers/navigation";

interface TeamMember {
  name: string;
  imageUrl: string;
  social: {
    email?: string;
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

export default function TeamPage() {
  const teamMembers: TeamMember[] = [
    {
      name: "Jan Allen Almario",
      imageUrl: "/Aboutus-Allen.jpg",
      social: {
        email: "allen@example.com",
        github: "https://github.com/allenalmario",
        linkedin: "https://linkedin.com/in/allenalmario",
      },
    },
    {
      name: "Lorenzo Menil Jr.",
      imageUrl: "/Aboutus-Lorenzo.jpg",
      social: {
        email: "lorenzo@example.com",
        github: "https://github.com/lorenzomenil",
        linkedin: "https://linkedin.com/in/lorenzomenil",
      },
    },
    {
      name: "Bianca Salunga",
      imageUrl: "/Aboutus-Bianca.jpeg",
      social: {
        email: "bianca@example.com",
        twitter: "https://twitter.com/biancadesigns",
        linkedin: "https://linkedin.com/in/biancasalunga",
      },
    },
    {
      name: "Angelo Tiquio",
      imageUrl: "/Aboutus-Angelo.jpg",
      social: {
        email: "angelo@example.com",
        github: "https://github.com/angelotiquio",
        linkedin: "https://linkedin.com/in/angelotiquio",
      },
    },

    {
      name: "Michael Valdez",
      imageUrl: "/Aboutus-Mike.jpg",
      social: {
        email: "Mike@example.com",
        github: "https://github.com/MicahelValdez",
        linkedin: "https://linkedin.com/in/michaelvaldez",
      },
    },
  ];

  return (
    <div className="h-screen flex flex-col">
      <MainNav />
      <div className="flex-1 relative">
        {/* Background gradients */}
        <div className="absolute inset-0 animate-gradient-shift bg-gradient-to-br from-[#F9F7D9] via-[#E3F6EF] to-[#F0E6FA] opacity-80" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-[#F9F7D9] blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-[15%] right-[10%] w-80 h-80 rounded-full bg-[#E3F6EF] blur-3xl animate-float" />
          <div className="absolute top-[60%] left-[50%] w-72 h-72 rounded-full bg-[#F0E6FA] blur-3xl animate-pulse-slower" />
        </div>

        {/* Scrollable content */}
        <div className="relative h-full overflow-y-auto">
          <main className="flex flex-col items-center py-8 px-4">
            <div className="w-full max-w-4xl">
              <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-[#2D3142] mb-4">
                  Meet Our Team
                </h1>
                <p className="text-[#5D6470] max-w-2xl mx-auto">
                  The passionate individuals behind Sentimo who are dedicated to
                  creating a supportive space for your journaling journey and
                  emotional wellbeing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teamMembers.map((member, index) => (
                  <Card
                    key={index}
                    className="bg-white/80 backdrop-blur-sm border-none shadow-md overflow-hidden"
                  >
                    <div className="aspect-square relative">
                      <Image
                        src={member.imageUrl || "/placeholder.svg"}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="mb-4">
                        <h2 className="text-xl font-semibold text-[#2D3142]">
                          {member.name}
                        </h2>
                      </div>
                      <div className="flex space-x-2">
                        {member.social.email && (
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8"
                          >
                            <a
                              href={`mailto:${member.social.email}`}
                              aria-label={`Email ${member.name}`}
                            >
                              <Mail className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {member.social.twitter && (
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8"
                          >
                            <a
                              href={member.social.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${member.name}'s Twitter`}
                            >
                              <Twitter className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {member.social.github && (
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8"
                          >
                            <a
                              href={member.social.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${member.name}'s GitHub`}
                            >
                              <Github className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        {member.social.linkedin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8"
                          >
                            <a
                              href={member.social.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${member.name}'s LinkedIn`}
                            >
                              <Linkedin className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-16 mb-8 text-center bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-md">
                <h2 className="text-2xl font-semibold text-[#2D3142] mb-4">
                  Join Our Team
                </h2>
                <p className="text-[#5D6470] mb-6 max-w-2xl mx-auto">
                  We're always looking for passionate individuals who care about
                  mental health and wellbeing. If you're interested in
                  contributing to Sentimo, we'd love to hear from you.
                </p>
                <Button className="bg-[#05a653] hover:bg-[#048a45]">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Us
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
