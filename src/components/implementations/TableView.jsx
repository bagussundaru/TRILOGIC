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
import {
    MoreHorizontal,
    Building,
    ScanLine,
    Calendar,
    ArrowUpDown
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TableView({ implementations }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'In Progress': return 'default'; // primary
            case 'Planning': return 'secondary';
            case 'Completed': return 'outline'; // green-ish usually handled by class
            case 'On Hold': return 'destructive';
            default: return 'secondary';
        }
    };

    const getHealthBadge = (health) => {
        let colorClass = "bg-gray-100 text-gray-800";
        if (health === 'Healthy') colorClass = "bg-emerald-100 text-emerald-700";
        if (health === 'At Risk') colorClass = "bg-amber-100 text-amber-700";
        if (health === 'Critical') colorClass = "bg-red-100 text-red-700";

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                {health}
            </span>
        );
    };

    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-gray-50/50">
                    <TableRow>
                        <TableHead className="w-[120px] font-semibold">Project Code</TableHead>
                        <TableHead className="min-w-[200px] font-semibold">Project Name</TableHead>
                        <TableHead className="font-semibold">Customer</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Health</TableHead>
                        <TableHead className="min-w-[150px] font-semibold">Progress</TableHead>
                        <TableHead className="font-semibold">
                            <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent">
                                Due Date <ArrowUpDown className="ml-2 h-3 w-3" />
                            </Button>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {implementations.map((impl) => (
                        <TableRow key={impl.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell className="font-medium text-teal-600">
                                {impl.id.toUpperCase().replace('IMPL_', 'PMO-2024-00')}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-900">{impl.name}</span>
                                    <span className="text-xs text-gray-500">{impl.type} Project</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded bg-gray-100">
                                        {impl.type === 'IT' ? <ScanLine className="w-3 h-3 text-gray-500" /> : <Building className="w-3 h-3 text-gray-500" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">PLN {impl.customer_region}</span>
                                        <span className="text-xs text-gray-400">{impl.customer_region}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={getStatusColor(impl.status)} className="rounded-md font-normal">
                                    {impl.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {getHealthBadge(impl.health_status)}
                            </TableCell>
                            <TableCell>
                                <div className="flexitems-center gap-3">
                                    <Progress value={impl.completion_percentage} className="h-2 w-full bg-gray-100" />
                                    <span className="text-xs text-gray-500 font-medium mt-1 block">{impl.completion_percentage}%</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center text-sm text-gray-500">
                                    {/* Mock Due Date calculation */}
                                    {new Date(new Date(impl.created_date).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-xl">
                                        <DropdownMenuItem>View details</DropdownMenuItem>
                                        <DropdownMenuItem>Edit project</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600">Archive</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
