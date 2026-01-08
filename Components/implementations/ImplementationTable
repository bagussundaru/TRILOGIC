import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { format } from 'date-fns';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye,
  Edit2,
  MoreHorizontal,
  Building2,
  MapPin
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

export default function ImplementationTable({ implementations, onEdit }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all');
  const [sortField, setSortField] = useState('created_date');
  const [sortOrder, setSortOrder] = useState('desc');

  const statusColors = {
    'Planning': 'bg-slate-100 text-slate-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'On Hold': 'bg-amber-100 text-amber-700',
    'Completed': 'bg-emerald-100 text-emerald-700',
    'Cancelled': 'bg-red-100 text-red-700',
  };

  const healthColors = {
    'On Track': 'bg-emerald-100 text-emerald-700',
    'At Risk': 'bg-amber-100 text-amber-700',
    'Critical': 'bg-red-100 text-red-700',
    'Completed': 'bg-indigo-100 text-indigo-700',
  };

  const filteredImplementations = implementations
    .filter(impl => {
      const matchesSearch = 
        impl.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        impl.project_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        impl.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || impl.status === statusFilter;
      const matchesHealth = healthFilter === 'all' || impl.health_status === healthFilter;
      return matchesSearch && matchesStatus && matchesHealth;
    })
    .sort((a, b) => {
      const aVal = a[sortField] || '';
      const bVal = b[sortField] || '';
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-xl font-semibold text-gray-800">Implementation Projects</CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[200px] bg-gray-50 border-gray-200"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-gray-50 border-gray-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={healthFilter} onValueChange={setHealthFilter}>
              <SelectTrigger className="w-[140px] bg-gray-50 border-gray-200">
                <SelectValue placeholder="Health" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Health</SelectItem>
                <SelectItem value="On Track">On Track</SelectItem>
                <SelectItem value="At Risk">At Risk</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
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
                <TableHead className="font-semibold text-gray-700">
                  <button onClick={() => toggleSort('project_code')} className="flex items-center gap-1 hover:text-gray-900">
                    Project Code <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead className="font-semibold text-gray-700">Project Name</TableHead>
                <TableHead className="font-semibold text-gray-700">Customer</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Health</TableHead>
                <TableHead className="font-semibold text-gray-700">Progress</TableHead>
                <TableHead className="font-semibold text-gray-700">
                  <button onClick={() => toggleSort('target_end_date')} className="flex items-center gap-1 hover:text-gray-900">
                    Due Date <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredImplementations.map((impl, index) => (
                  <motion.tr
                    key={impl.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50/50 cursor-pointer"
                  >
                    <TableCell className="font-mono text-sm text-blue-600">{impl.project_code}</TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-800">{impl.project_name}</div>
                      {impl.project_type && (
                        <span className="text-xs text-gray-400">{impl.project_type}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm">{impl.customer_name}</div>
                          {impl.customer_region && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <MapPin className="w-3 h-3" />
                              {impl.customer_region}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[impl.status] || statusColors['Planning']}>
                        {impl.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={healthColors[impl.health_status] || healthColors['On Track']}>
                        {impl.health_status || 'On Track'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <div className="flex items-center gap-2">
                          <Progress value={impl.progress_percentage || 0} className="h-2" />
                          <span className="text-xs text-gray-500">{impl.progress_percentage || 0}%</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {impl.target_end_date ? format(new Date(impl.target_end_date), 'MMM d, yyyy') : '-'}
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
                            <Link to={createPageUrl(`ImplementationDetail?id=${impl.id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(impl)}>
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
          {filteredImplementations.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No implementations found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}