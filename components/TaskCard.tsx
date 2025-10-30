// src/components/TaskCard.tsx

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Card } from './common/Card';
import { Task, SubmissionStatus } from '../types';

interface TaskCardProps {
  task: Task & { submission?: { id: string; status: SubmissionStatus; submittedAt: string } | null };
  onPress: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress }) => {
  const getTaskTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      TEXT: 'edit',
      IMAGE: 'image',
      VIDEO: 'video',
      QUIZ: 'help-circle',
      FORM: 'file-text',
      PICK_ONE: 'check-square',
      CHECKLIST: 'list',
    };
    return icons[type] || 'file';
  };

  const getStatusBadge = () => {
    if (!task.submission) {
      return (
        <View className="bg-gray-200 px-3 py-1 rounded-full">
          <Text className="text-gray-600 text-xs font-semibold">Not Started</Text>
        </View>
      );
    }

    const statusConfig = {
      APPROVED: { bg: 'bg-secondary/10', text: 'text-secondary', label: 'Approved' },
      PENDING: { bg: 'bg-accent/10', text: 'text-accent', label: 'Pending' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-600', label: 'Rejected' },
    };

    const config = statusConfig[task.submission.status] || statusConfig.PENDING;

    return (
      <View className={`${config.bg} px-3 py-1 rounded-full`}>
        <Text className={`${config.text} text-xs font-semibold`}>{config.label}</Text>
      </View>
    );
  };

  return (
    <Card className="mb-4">
      <TouchableOpacity onPress={onPress}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-2">
              <View className="bg-primary/10 p-2 rounded-lg mr-2">
                <Icon name={getTaskTypeIcon(task.taskType)} size={16} color="#8B5CF6" />
              </View>
              <Text className="text-gray-900 font-semibold text-base flex-1">
                {task.title}
              </Text>
            </View>
            <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
              {task.description}
            </Text>
            <View className="flex-row items-center">
              <Icon name="type" size={12} color="#9CA3AF" />
              <Text className="text-gray-500 text-xs ml-1">{task.taskType}</Text>
              {task.isRequired && (
                <>
                  <View className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
                  <Text className="text-red-500 text-xs">Required</Text>
                </>
              )}
            </View>
          </View>
          <View className="items-end">
            {getStatusBadge()}
            <Icon name="chevron-right" size={20} color="#9CA3AF" className="mt-2" />
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
};
