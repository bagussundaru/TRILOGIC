import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Loader2, Save, X } from "lucide-react";

export default function ImplementationForm({ implementation, open, onClose, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    project_code: '',
    project_name: '',
    customer_name: '',
    customer_region: '',
    project_type: 'New Installation',
    status: 'Planning',
    health_status: 'On Track',
    priority: 'Medium',
    start_date: '',
    target_end_date: '',
    budget_allocated: '',
    project_manager: '',
    device_count: '',
    description: '',
    notes: '',
  });

  useEffect(() => {
    if (implementation) {
      setFormData({
        project_code: implementation.project_code || '',
        project_name: implementation.project_name || '',
        customer_name: implementation.customer_name || '',
        customer_region: implementation.customer_region || '',
        project_type: implementation.project_type || 'New Installation',
        status: implementation.status || 'Planning',
        health_status: implementation.health_status || 'On Track',
        priority: implementation.priority || 'Medium',
        start_date: implementation.start_date || '',
        target_end_date: implementation.target_end_date || '',
        budget_allocated: implementation.budget_allocated || '',
        project_manager: implementation.project_manager || '',
        device_count: implementation.device_count || '',
        description: implementation.description || '',
        notes: implementation.notes || '',
      });
    } else {
      // Generate new project code
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setFormData(prev => ({
        ...prev,
        project_code: `PMO-${year}-${random}`,
      }));
    }
  }, [implementation, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      budget_allocated: formData.budget_allocated ? Number(formData.budget_allocated) : null,
      device_count: formData.device_count ? Number(formData.device_count) : 0,
    };
    onSave(dataToSave);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">
            {implementation ? 'Edit Implementation' : 'New Implementation'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_code">Project Code</Label>
              <Input
                id="project_code"
                value={formData.project_code}
                onChange={(e) => handleChange('project_code', e.target.value)}
                placeholder="PMO-2024-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project_type">Project Type</Label>
              <Select value={formData.project_type} onValueChange={(v) => handleChange('project_type', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New Installation">New Installation</SelectItem>
                  <SelectItem value="Upgrade">Upgrade</SelectItem>
                  <SelectItem value="Migration">Migration</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project_name">Project Name *</Label>
            <Input
              id="project_name"
              value={formData.project_name}
              onChange={(e) => handleChange('project_name', e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name *</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => handleChange('customer_name', e.target.value)}
                placeholder="Customer/Client name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_region">Region</Label>
              <Select value={formData.customer_region} onValueChange={(v) => handleChange('customer_region', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Jakarta">Jakarta</SelectItem>
                  <SelectItem value="Jawa Barat">Jawa Barat</SelectItem>
                  <SelectItem value="Jawa Tengah">Jawa Tengah</SelectItem>
                  <SelectItem value="Jawa Timur">Jawa Timur</SelectItem>
                  <SelectItem value="Sumatera">Sumatera</SelectItem>
                  <SelectItem value="Kalimantan">Kalimantan</SelectItem>
                  <SelectItem value="Sulawesi">Sulawesi</SelectItem>
                  <SelectItem value="Papua">Papua</SelectItem>
                  <SelectItem value="Bali & Nusa Tenggara">Bali & Nusa Tenggara</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="health_status">Health</Label>
              <Select value={formData.health_status} onValueChange={(v) => handleChange('health_status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="On Track">On Track</SelectItem>
                  <SelectItem value="At Risk">At Risk</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(v) => handleChange('priority', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_end_date">Target End Date</Label>
              <Input
                id="target_end_date"
                type="date"
                value={formData.target_end_date}
                onChange={(e) => handleChange('target_end_date', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget_allocated">Budget (IDR)</Label>
              <Input
                id="budget_allocated"
                type="number"
                value={formData.budget_allocated}
                onChange={(e) => handleChange('budget_allocated', e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="device_count">Device Count</Label>
              <Input
                id="device_count"
                type="number"
                value={formData.device_count}
                onChange={(e) => handleChange('device_count', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project_manager">Project Manager</Label>
            <Input
              id="project_manager"
              value={formData.project_manager}
              onChange={(e) => handleChange('project_manager', e.target.value)}
              placeholder="PM name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Project description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          <SheetFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-teal-600 hover:bg-teal-700">
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}