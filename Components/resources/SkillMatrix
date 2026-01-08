import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

export default function SkillMatrix({ resources }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Extract all unique skills
  const allSkills = [...new Set(
    resources.flatMap(r => r.skills || [])
  )].sort();

  // Filter skills based on search
  const filteredSkills = allSkills.filter(skill =>
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get resources that have each skill
  const getResourcesWithSkill = (skill) => {
    return resources.filter(r => r.skills?.includes(skill));
  };

  // Count resources per skill level for a skill
  const getSkillLevelCounts = (skill) => {
    const resourcesWithSkill = getResourcesWithSkill(skill);
    const counts = {
      Expert: 0,
      Advanced: 0,
      Intermediate: 0,
      Beginner: 0,
    };
    
    resourcesWithSkill.forEach(resource => {
      const level = resource.skill_levels?.[skill] || 'Intermediate';
      counts[level]++;
    });
    
    return counts;
  };

  const levelColors = {
    'Expert': 'bg-purple-100 text-purple-700',
    'Advanced': 'bg-blue-100 text-blue-700',
    'Intermediate': 'bg-emerald-100 text-emerald-700',
    'Beginner': 'bg-amber-100 text-amber-700',
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Skills Matrix
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[200px] bg-gray-50 border-gray-200"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredSkills.length > 0 ? (
          <div className="space-y-4">
            {filteredSkills.map((skill, index) => {
              const resourcesWithSkill = getResourcesWithSkill(skill);
              const levelCounts = getSkillLevelCounts(skill);
              const totalCount = resourcesWithSkill.length;

              return (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-800">{skill}</h4>
                        <Badge variant="outline" className="text-xs">
                          {totalCount} {totalCount === 1 ? 'person' : 'people'}
                        </Badge>
                      </div>
                      
                      {/* Skill level breakdown */}
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(levelCounts).map(([level, count]) => (
                          count > 0 && (
                            <Badge 
                              key={level} 
                              className={`text-xs ${levelColors[level]}`}
                            >
                              {level}: {count}
                            </Badge>
                          )
                        ))}
                      </div>

                      {/* Resource names */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {resourcesWithSkill.slice(0, 5).map((resource, i) => {
                          const level = resource.skill_levels?.[skill];
                          return (
                            <div 
                              key={i} 
                              className="text-xs bg-white px-2 py-1 rounded border border-gray-200"
                            >
                              {resource.full_name}
                              {level && (
                                <span className="ml-1 text-gray-400">({level})</span>
                              )}
                            </div>
                          );
                        })}
                        {resourcesWithSkill.length > 5 && (
                          <div className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-500">
                            +{resourcesWithSkill.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Visual indicator */}
                    <div className="w-full md:w-48">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
                        {Object.entries(levelCounts).map(([level, count]) => {
                          const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
                          const colors = {
                            'Expert': 'bg-purple-500',
                            'Advanced': 'bg-blue-500',
                            'Intermediate': 'bg-emerald-500',
                            'Beginner': 'bg-amber-500',
                          };
                          return percentage > 0 ? (
                            <div
                              key={level}
                              className={colors[level]}
                              style={{ width: `${percentage}%` }}
                              title={`${level}: ${count}`}
                            />
                          ) : null;
                        })}
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-400">
                        <span>Beginner</span>
                        <span>Expert</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>No skills found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}