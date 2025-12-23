// screens/task/TaskDetailScreen.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { taskApi } from '../../api/taskApi';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { TaskSubmissionHandler } from './TaskSubmissionHandler';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, fontSize, fontWeight, spacing, Fonts } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export const TaskDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const taskId = id;

  const { theme } = useTheme();
  const [taskData, setTaskData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (taskId) {
      fetchTaskDetail();
    }
  }, [taskId]);

  const fetchTaskDetail = async () => {
    try {
      const response = await taskApi.getTaskDetails(taskId);
      if (response.success && response.data) {
        setTaskData(response.data);
      }
    } catch (error) {
      console.error('Task detail error:', error);
      Alert.alert('Error', 'Failed to load task details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (submittedContent: any, submittedFiles: any[]) => {
    try {
      await taskApi.submitTask(taskId, submittedContent, submittedFiles);
      Alert.alert('Success', 'Task submitted successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      fetchTaskDetail();
    } catch (error: any) {
      throw error;
    }
  };

  if (isLoading) return <Loading message="Loading task..." />;

  if (!taskData) {
    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <Icon name="alert-circle" size={64} color={theme.borderLight} />
        <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
          Task not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: theme.primary }]}
        >
          <Text style={[styles.backButtonText, { color: theme.textInverse, fontFamily: Fonts.body }]}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
        </SafeAreaView>
    );
  }

  return (
     <SafeAreaView style={{ flex: 1 }} edges={['top']}>
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBackButton}
        >
          <Icon name="arrow-left" size={24} color={theme.textInverse} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.textInverse, fontFamily: Fonts.header }]} numberOfLines={2}>
            {taskData.task.title}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.primaryLight, fontFamily: Fonts.body }]}>
            {taskData.task.tabName}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Task Description */}
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon name="info" size={20} color={theme.primary} style={styles.infoIcon} />
            <Text style={[styles.infoText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
              {taskData.task.description}
            </Text>
          </View>
        </Card>

        {/* Submission Status */}
        {taskData.submission && (
          <Card style={[styles.submissionCard, { backgroundColor: theme.successLight }]}>
            <View style={styles.submissionRow}>
              <Icon name="check-circle" size={24} color={theme.success} />
              <View style={styles.submissionText}>
                <Text style={[styles.submissionTitle, { color: theme.success, fontFamily: Fonts.body }]}>
                  Submitted
                </Text>
                <Text style={[styles.submissionDate, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                  {new Date(taskData.submission.submittedAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Use TaskSubmissionHandler for all task types */}
      {!taskData.submission && (
        <TaskSubmissionHandler
          taskType={taskData.task.taskType}
          taskOptions={taskData.task.options}
          existingSubmission={taskData.submission}
          onSubmit={handleSubmit}
        />
      )}
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.lg,
    marginTop: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.lg,
   paddingTop: spacing.lg,   
    paddingBottom: spacing.lg,
  },
  headerBackButton: {
    marginRight: spacing.md,
    padding: spacing.sm,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  backButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
  },
  headerSubtitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  infoIcon: {
    marginRight: spacing.sm,
  },
  infoText: {
    flex: 1,
    lineHeight: fontSize.base * 1.5,
  },
  submissionCard: {
    marginBottom: spacing.lg,
  },
  submissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submissionText: {
    marginLeft: spacing.md,
  },
  submissionTitle: {
    fontWeight: fontWeight.bold,
    fontSize: fontSize.base,
  },
  submissionDate: {
    fontSize: fontSize.sm,
  },
});

export default TaskDetailScreen;