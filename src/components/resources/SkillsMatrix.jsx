import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Info } from "lucide-react";

export default function SkillsMatrix({ resources }) {

    // Aggregate Skills
    const skillMap = {};

    resources.forEach(res => {
        if (!res.skills) return;
        res.skills.forEach(skill => {
            if (!skillMap[skill]) {
                skillMap[skill] = {
                    name: skill,
                    count: 0,
                    experts: [],
                    beginners: 0 // Mock: Assign levels randomly for demo
                };
            }
            skillMap[skill].count++;
            // Mock logic: Project Managers are "Expert" in PM, Devs "Expert" in code
            const isExpert = Math.random() > 0.4;
            if (isExpert) skillMap[skill].experts.push(res);
            else skillMap[skill].beginners++;
        });
    });

    const skills = Object.values(skillMap).sort((a, b) => b.count - a.count);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Skills Matrix</h3>
                <div className="relative w-[300px]">
                    <input
                        type="text"
                        placeholder="Search skills..."
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {skills.map((skill, index) => (
                    <Card key={index} className="border border-gray-100 hover:border-teal-200 transition-colors shadow-sm">
                        <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                            {/* Skill Info */}
                            <div className="w-[200px]">
                                <h4 className="font-bold text-gray-800 text-lg">{skill.name}</h4>
                                <Badge variant="secondary" className="mt-2 bg-gray-100 text-gray-600 font-normal">
                                    {skill.count} people
                                </Badge>
                            </div>

                            {/* Levels/Bars */}
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-widest font-medium">
                                    <span>Beginner</span>
                                    <span>Expert</span>
                                </div>
                                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
                                    {/* Beginner segment */}
                                    <div
                                        className="h-full bg-blue-300"
                                        style={{ width: `${(skill.beginners / skill.count) * 100}%` }}
                                    />
                                    {/* Expert segment */}
                                    <div
                                        className="h-full bg-blue-600"
                                        style={{ width: `${(skill.experts.length / skill.count) * 100}%` }}
                                    />
                                </div>
                                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                                    {skill.experts.map(exp => (
                                        <div key={exp.id} className="flex items-center gap-1 bg-gray-50 rounded-full px-2 py-1 border border-gray-100 flex-shrink-0">
                                            <Avatar className="w-4 h-4 text-[8px]">
                                                <AvatarFallback className="bg-blue-100 text-blue-700">{exp.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs text-gray-600 whitespace-nowrap">{exp.name} (Adv)</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
