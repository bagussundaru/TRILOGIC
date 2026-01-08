import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Mail, HardHat, Server } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TeamList({ resources }) {

    const getStatusVariant = (status) => {
        switch (status) {
            case 'Available': return 'default'; // we'll style manually for green
            case 'Busy': return 'destructive'; // red/pink base
            case 'Overloaded': return 'destructive';
            case 'Partially Available': return 'secondary'; // yellow-ish
            default: return 'outline';
        }
    };

    const getStatusStyle = (status) => {
        if (status === 'Available') return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
        if (status === 'Partially Available') return "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200";
        if (status === 'Busy') return "bg-red-50 text-red-600 hover:bg-red-100 border-red-100";
        if (status === 'Overloaded') return "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200";
        return "";
    };

    const getUtilizationColor = (load, capacity) => {
        const percentage = (load / capacity) * 100;
        if (percentage > 100) return "bg-purple-500";
        if (percentage > 85) return "bg-red-500";
        if (percentage > 60) return "bg-teal-500";
        return "bg-green-500";
    };

    const getIcon = (type) => {
        if (type === 'Machine') return <HardHat className="w-4 h-4" />;
        if (type === 'Digital') return <Server className="w-4 h-4" />;
        return null;
    };

    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            {/* Toolbar / Filters Mock */}
            <div className="p-4 border-b border-gray-50 flex items-center gap-4 bg-gray-50/30">
                <input
                    type="text"
                    placeholder="Search resources..."
                    className="px-3 py-2 rounded-xl border border-gray-200 text-sm w-[300px] focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex-1" />
                {/* Placeholders for dropdowns to match mockup */}
                <Button variant="outline" size="sm" className="rounded-lg border-gray-200 text-gray-500">All Roles</Button>
                <Button variant="outline" size="sm" className="rounded-lg border-gray-200 text-gray-500">All Status</Button>
            </div>

            <Table>
                <TableHeader className="bg-gray-50/50">
                    <TableRow>
                        <TableHead className="w-[300px] font-semibold">Name</TableHead>
                        <TableHead className="font-semibold">Role</TableHead>
                        <TableHead className="font-semibold">Department</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="min-w-[150px] font-semibold">Utilization</TableHead>
                        <TableHead className="min-w-[300px] font-semibold">Skills</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {resources.map((res) => {
                        const utilization = Math.round((res.load / res.capacity) * 100);
                        return (
                            <TableRow key={res.id} className="hover:bg-gray-50/50 transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm bg-teal-50">
                                            <AvatarFallback className="text-teal-700 font-bold">
                                                {res.type === 'Human' ? res.name.charAt(0) : getIcon(res.type)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">{res.name}</span>
                                            {res.email && (
                                                <div className="flex items-center text-xs text-gray-400 gap-1">
                                                    <Mail className="w-3 h-3" /> {res.email}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm font-medium text-gray-700">{res.role}</span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-gray-500">{res.department}</span>
                                </TableCell>
                                <TableCell>
                                    <Badge className={`rounded-md font-normal border ${getStatusStyle(res.status)}`}>
                                        {res.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 pr-4">
                                        <div className="flex justify-between items-end">
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${getUtilizationColor(res.load, res.capacity)}`}
                                                    style={{ width: `${Math.min(utilization, 100)}%` }}
                                                />
                                            </div>
                                            <span className={`text-xs ml-2 font-bold ${utilization > 100 ? 'text-red-500' : 'text-gray-600'}`}>
                                                {utilization}%
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-gray-400">
                                            {typeLabels[res.type] || '40h/week'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {res.skills && res.skills.slice(0, 2).map(skill => (
                                            <Badge key={skill} variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200 rounded-md font-normal text-xs px-2 py-0.5">
                                                {skill}
                                            </Badge>
                                        ))}
                                        {res.skills && res.skills.length > 2 && (
                                            <Badge variant="secondary" className="bg-gray-50 text-gray-500 border border-gray-200 rounded-md text-xs px-1.5 py-0.5">
                                                +{res.skills.length - 2}
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl">
                                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                                            <DropdownMenuItem>Allocate Resource</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

const typeLabels = {
    'Human': '40h/week',
    'Machine': 'Availability',
    'Digital': 'Uptime'
}
