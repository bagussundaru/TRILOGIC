import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Filter, 
  Eye,
  Edit2,
  MoreHorizontal,
  User,
  Mail,
  Phone
} from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

export default function ResourceTable({ resources, onEdit }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const statusColors = {
    'Available': 'bg-emerald-100 text-emerald-700',
    'Busy': 'bg-red-100 text-red-700',
    'Partially Available': 'bg-amber-100 text-amber-700',
    'On Leave': 'bg-gray-100 text-gray-700',
    'Inactive': 'bg-slate-100 text-slate-700',
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 70) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = 
      resource.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.role?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || resource.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || resource.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-xl font-semibold text-gray-800">Team Resources</CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[200px] bg-gray-50 border-gray-200"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px] bg-gray-50 border-gray-200">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Project Manager">Project Manager</SelectItem>
                <SelectItem value="Technical Lead">Technical Lead</SelectItem>
                <SelectItem value="Engineer">Engineer</SelectItem>
                <SelectItem value="Technician">Technician</SelectItem>
                <SelectItem value="QA Specialist">QA Specialist</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] bg-gray-50 border-gray-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Busy">Busy</SelectItem>
                <SelectItem value="Partially Available">Partially Available</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold text-gray-700">Name</TableHead>
                <TableHead className="font-semibold text-gray-700">Role</TableHead>
                <TableHead className="font-semibold text-gray-700">Department</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Utilization</TableHead>
                <TableHead className="font-semibold text-gray-700">Skills</TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredResources.map((resource, index) => (
                  <motion.tr
                    key={resource.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50/50 cursor-pointer"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {resource.full_name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{resource.full_name}</div>
                          {resource.email && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Mail className="w-3 h-3" />
                              {resource.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{resource.role}</div>
                      {resource.employment_type && resource.employment_type !== 'Full-time' && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {resource.employment_type}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{resource.department || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[resource.status] || statusColors['Available']}>
                        {resource.status || 'Available'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-32">
                        <div className="flex items-center gap-2">
                          <Progress value={resource.current_utilization || 0} className="h-2" />
                          <span className={`text-xs font-medium ${getUtilizationColor(resource.current_utilization || 0)}`}>
                            {resource.current_utilization || 0}%
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 mt-1">
                          {resource.weekly_capacity_hours || 40}h/week
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {resource.skills && resource.skills.length > 0 ? (
                          <>
                            {resource.skills.slice(0, 3).map((skill, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {resource.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{resource.skills.length - 3}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-400">No skills listed</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={createPageUrl(`ResourceDetail?id=${resource.id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(resource)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
          {filteredResources.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No resources found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}