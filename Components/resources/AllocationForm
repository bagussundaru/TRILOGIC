import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Save, X, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AllocationForm({ 
  allocation, 
  resources, 
  implementations, 
  open, 
  onClose, 
  onSave, 
  isLoading 
}) {
  const [formData, setFormData] = useState({
    resource_id: '',
    implementation_id: '',
    allocation_type: 'Part-time',
    allocation_percentage: '',
    hours_per_week: '',
    start_date: '',
    end_date: '',
    status: 'Planned',
    role_in_project: '',
    billable: true,
    notes: '',
  });

  const [selectedResource, setSelectedResource] = useState(null);
  const [warning, setWarning] = useState('');

  useEffect(() => {
    if (allocation) {
      setFormData({
        resource_id: allocation.resource_id || '',
        implementation_id: allocation.implementation_id || '',
        allocation_type: allocation.allocation_type || 'Part-time',
        allocation_percentage: allocation.allocation_percentage || '',
        hours_per_week: allocation.hours_per_week || '',
        start_date: allocation.start_date || '',
        end_date: allocation.end_date || '',
        status: allocation.status || 'Planned',
        role_in_project: allocation.role_in_project || '',
        billable: allocation.billable !== undefined ? allocation.billable : true,
        notes: allocation.notes || '',
      });
    } else {
      setFormData({
        resource_id: '',
        implementation_id: '',
        allocation_type: 'Part-time',
        allocation_percentage: '',
        hours_per_week: '',
        start_date: '',
        end_date: '',
        status: 'Planned',
        role_in_project: '',
        billable: true,
        notes: '',
      });
    }
  }, [allocation, open]);

  useEffect(() => {
    if (formData.resource_id) {
      const resource = resources.find(r => r.id === formData.resource_id);
      setSelectedResource(resource);
      
      // Check for overallocation
      if (resource) {
        const currentUtilization = resource.current_utilization || 0;
        const newAllocation = Number(formData.allocation_percentage) || 0;
        const totalUtilization = currentUtilization + newAllocation;
        
        if (totalUtilization > 100) {
          setWarning(`Warning: This allocation will overallocate ${resource.full_name} by ${totalUtilization - 100}%`);
        } else if (totalUtilization > 80) {
          setWarning(`Note: This allocation will bring ${resource.full_name} to ${totalUtilization}% utilization`);
        } else {
          setWarning('');
        }
      }
    }
  }, [formData.resource_id, formData.allocation_percentage, resources]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      allocation_percentage: Number(formData.allocation_percentage),
      hours_per_week: formData.hours_per_week ? Number(formData.hours_per_week) : null,
    };
    onSave(dataToSave);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {allocation ? 'Edit Allocation' : 'Allocate Resource'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resource_id">Resource *</Label>
            <Select 
              value={formData.resource_id} 
              onValueChange={(v) => handleChange('resource_id', v)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select resource" />
              </SelectTrigger>
              <SelectContent>
                {resources.map(resource => (
                  <SelectItem key={resource.id} value={resource.id}>
                    {resource.full_name} ({resource.role}) - {resource.current_utilization || 0}% utilized
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedResource && (
              <p className="text-xs text-gray-500">
                Current capacity: {selectedResource.weekly_capacity_hours || 40}h/week • 
                Status: {selectedResource.status}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="implementation_id">Project *</Label>
            <Select 
              value={formData.implementation_id} 
              onValueChange={(v) => handleChange('implementation_id', v)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {implementations.map(impl => (
                  <SelectItem key={impl.id} value={impl.id}>
                    {impl.project_code} - {impl.project_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {warning && (
            <Alert className={warning.startsWith('Warning') ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}>
              <AlertTriangle className={`w-4 h-4 ${warning.startsWith('Warning') ? 'text-red-600' : 'text-amber-600'}`} />
              <AlertDescription className={warning.startsWith('Warning') ? 'text-red-700' : 'text-amber-700'}>
                {warning}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="allocation_type">Allocation Type</Label>
              <Select value={formData.allocation_type} onValueChange={(v) => handleChange('allocation_type', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="As-needed">As-needed</SelectItem>
                  <SelectItem value="On-call">On-call</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planned">Planned</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="allocation_percentage">Allocation % *</Label>
              <Input
                id="allocation_percentage"
                type="number"
                min="0"
                max="100"
                value={formData.allocation_percentage}
                onChange={(e) => handleChange('allocation_percentage', e.target.value)}
                placeholder="50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours_per_week">Hours/Week</Label>
              <Input
                id="hours_per_week"
                type="number"
                min="0"
                value={formData.hours_per_week}
                onChange={(e) => handleChange('hours_per_week', e.target.value)}
                placeholder="20"
              />
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
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role_in_project">Role in Project</Label>
            <Input
              id="role_in_project"
              value={formData.role_in_project}
              onChange={(e) => handleChange('role_in_project', e.target.value)}
              placeholder="e.g., Lead Developer, QA Tester"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="billable"
              checked={formData.billable}
              onChange={(e) => handleChange('billable', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="billable" className="cursor-pointer">Billable</Label>
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

          <DialogFooter className="gap-2 pt-4">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}