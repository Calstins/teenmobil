// screens/task/TaskDetailScreen.tsx
import { useLocalSearchParams, useRouter } from 'expo-router'; // ← Added
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { taskApi } from '../../api/taskApi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, fontSize, fontWeight, spacing } from '../../theme';

export const TaskDetailScreen = () => { // ← Removed props
  const router = useRouter(); // ← Added
  const { id } = useLocalSearchParams<{ id: string }>(); // ← Added - gets taskId from URL
  const taskId = id; // ← Use id from URL params
  
  const { theme } = useTheme();
  const [taskData, setTaskData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState<any>({});
  const [files, setFiles] = useState<any[]>([]);

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
        if (response.data.submission) {
          setContent(response.data.submission.content);
        }
      }
    } catch (error) {
      console.error('Task detail error:', error);
      Alert.alert('Error', 'Failed to load task details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.text && files.length === 0) {
      Alert.alert('Error', 'Please add some content or upload files');
      return;
    }

    setIsSubmitting(true);
    try {
      await taskApi.submitTask(taskId, content, files);
      Alert.alert('Success', 'Task submitted successfully!', [
        { text: 'OK', onPress: () => router.back() }, // ← Changed
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit task');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading message="Loading task..." />;
  
  if (!taskData) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Task not found</Text>
        <Button 
          title="Go Back" 
          onPress={() => router.back()} // ← Added
          style={{ marginTop: spacing.md }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity 
          onPress={() => router.back()} // ← Changed
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={theme.textInverse} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textInverse }]}>
          {taskData.task.title}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Icon
              name="info"
              size={20}
              color={theme.primary}
              style={styles.infoIcon}
            />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {taskData.task.description}
            </Text>
          </View>
        </Card>

        {taskData.submission && (
          <Card style={[styles.submissionCard, { backgroundColor: theme.successLight }]}>
            <View style={styles.submissionRow}>
              <Icon name="check-circle" size={24} color={theme.secondary} />
              <View style={styles.submissionText}>
                <Text style={[styles.submissionTitle, { color: theme.secondary }]}>
                  Submitted
                </Text>
                <Text style={[styles.submissionDate, { color: theme.textSecondary }]}>
                  {new Date(taskData.submission.submittedAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {!taskData.submission && (
          <>
            <View style={styles.responseContainer}>
              <Text style={[styles.responseLabel, { color: theme.textSecondary }]}>
                Your Response
              </Text>
              <TextInput
                style={[
                  styles.responseInput,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  },
                ]}
                placeholder="Type your response here..."
                placeholderTextColor={theme.textTertiary}
                multiline
                value={content.text || ''}
                onChangeText={(text) => setContent({ ...content, text })}
              />
            </View>

            <Button
              title="Submit Task"
              onPress={handleSubmit}
              isLoading={isSubmitting}
              style={styles.submitButton}
            />
          </>
        )}
      </ScrollView>
    </View>
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
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
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
  },
  submissionDate: {
    fontSize: fontSize.sm,
  },
  responseContainer: {
    marginBottom: spacing.md,
  },
  responseLabel: {
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  responseInput: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginBottom: spacing.lg,
  },
});

export default TaskDetailScreen;