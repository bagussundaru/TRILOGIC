import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, X, Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AutomationRuleForm({ rule, open, onClose, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    rule_name: '',
    description: '',
    rule_type: 'Status Change',
    trigger_condition: { field: '', operator: '', value: '' },
    actions: [],
    is_active: true,
    priority: 'Medium',
  });

  useEffect(() => {
    if (rule) {
      setFormData({
        rule_name: rule.rule_name || '',
        description: rule.description || '',
        rule_type: rule.rule_type || 'Status Change',
        trigger_condition: rule.trigger_condition || { field: '', operator: '', value: '' },
        actions: rule.actions || [],
        is_active: rule.is_active !== undefined ? rule.is_active : true,
        priority: rule.priority || 'Medium',
      });
    } else {
      setFormData({
        rule_name: '',
        description: '',
        rule_type: 'Status Change',
        trigger_condition: { field: '', operator: '', value: '' },
        actions: [],
        is_active: true,
        priority: 'Medium',
      });
    }
  }, [rule, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTriggerChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      trigger_condition: { ...prev.trigger_condition, [field]: value }
    }));
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, { action_type: 'send_notification', parameters: {} }]
    }));
  };

  const updateAction = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const removeAction = (index) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const ruleTypeTemplates = {
    'Status Change': { field: 'status', operator: 'changed_to', value: 'In Progress' },
    'Task Overdue': { field: 'due_date', operator: 'is_past', value: '' },
    'Risk Escalation': { field: 'risk_score', operator: 'greater_than', value: '7' },
    'Budget Threshold': { field: 'budget_utilization', operator: 'greater_than', value: '80' },
    'Milestone Alert': { field: 'target_end_date', operator: 'within_days', value: '7' },
    'Resource Overallocation': { field: 'utilization', operator: 'greater_than', value: '100' },
  };

  const handleRuleTypeChange = (value) => {
    handleChange('rule_type', value);
    handleChange('trigger_condition', ruleTypeTemplates[value] || {});
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {rule ? 'Edit Automation Rule' : 'Create Automation Rule'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="rule_name">Rule Name *</Label>
            <Input
              id="rule_name"
              value={formData.rule_name}
              onChange={(e) => handleChange('rule_name', e.target.value)}
              placeholder="Auto-create tasks on status change"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe what this automation does..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rule_type">Rule Type *</Label>
              <Select value={formData.rule_type} onValueChange={handleRuleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Status Change">Status Change</SelectItem>
                  <SelectItem value="Task Overdue">Task Overdue</SelectItem>
                  <SelectItem value="Risk Escalation">Risk Escalation</SelectItem>
                  <SelectItem value="Budget Threshold">Budget Threshold</SelectItem>
                  <SelectItem value="Milestone Alert">Milestone Alert</SelectItem>
                  <SelectItem value="Resource Overallocation">Resource Overallocation</SelectItem>
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

          {/* Trigger Condition */}
          <Card className="border-2 border-gray-200">
            <CardContent className="pt-4">
              <Label className="text-sm font-semibold mb-3 block">Trigger Condition</Label>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  placeholder="Field"
                  value={formData.trigger_condition?.field || ''}
                  onChange={(e) => handleTriggerChange('field', e.target.value)}
                />
                <Input
                  placeholder="Operator"
                  value={formData.trigger_condition?.operator || ''}
                  onChange={(e) => handleTriggerChange('operator', e.target.value)}
                />
                <Input
                  placeholder="Value"
                  value={formData.trigger_condition?.value || ''}
                  onChange={(e) => handleTriggerChange('value', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Actions (when triggered)</Label>
              <Button type="button" onClick={addAction} size="sm" variant="outline" className="gap-1">
                <Plus className="w-3 h-3" />
                Add Action
              </Button>
            </div>

            {formData.actions.map((action, index) => (
              <Card key={index} className="border-2 border-teal-100">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <Select 
                        value={action.action_type} 
                        onValueChange={(v) => updateAction(index, 'action_type', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="send_notification">Send Notification</SelectItem>
                          <SelectItem value="create_task">Create Task</SelectItem>
                          <SelectItem value="escalate">Escalate Issue</SelectItem>
                          <SelectItem value="log_activity">Log Activity</SelectItem>
                          <SelectItem value="update_status">Update Status</SelectItem>
                        </SelectContent>
                      </Select>

                      {action.action_type === 'send_notification' && (
                        <div className="space-y-2">
                          <Input
                            placeholder="Notification title"
                            value={action.parameters?.title || ''}
                            onChange={(e) => updateAction(index, 'parameters', { ...action.parameters, title: e.target.value })}
                          />
                          <Input
                            placeholder="Message"
                            value={action.parameters?.message || ''}
                            onChange={(e) => updateAction(index, 'parameters', { ...action.parameters, message: e.target.value })}
                          />
                        </div>
                      )}

                      {action.action_type === 'create_task' && (
                        <div className="space-y-2">
                          <Input
                            placeholder="Task name"
                            value={action.parameters?.task_name || ''}
                            onChange={(e) => updateAction(index, 'parameters', { ...action.parameters, task_name: e.target.value })}
                          />
                          <Input
                            placeholder="Description"
                            value={action.parameters?.description || ''}
                            onChange={(e) => updateAction(index, 'parameters', { ...action.parameters, description: e.target.value })}
                          />
                        </div>
                      )}

                      {action.action_type === 'escalate' && (
                        <Input
                          placeholder="Escalate to (email)"
                          value={action.parameters?.escalate_to || ''}
                          onChange={(e) => updateAction(index, 'parameters', { ...action.parameters, escalate_to: e.target.value })}
                        />
                      )}
                    </div>
                    <Button 
                      type="button" 
                      onClick={() => removeAction(index)} 
                      size="icon" 
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="is_active" className="cursor-pointer">Rule is active</Label>
          </div>

          <DialogFooter className="gap-2">
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
              Save Rule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}