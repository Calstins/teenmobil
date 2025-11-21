// screens/task/TaskSubmissionHandler.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Feather';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, Fonts } from '../../theme';
import { uploadImageToCloudinary } from '../../utils/cloudinaryUpload';
import { TaskType } from '../../types';

interface TaskSubmissionHandlerProps {
    taskType: TaskType;
    taskOptions?: any;
    existingSubmission?: any;
    onSubmit: (content: any, files: any[]) => Promise<void>;
}

export const TaskSubmissionHandler: React.FC<TaskSubmissionHandlerProps> = ({
    taskType,
    taskOptions,
    existingSubmission,
    onSubmit,
}) => {
    const { theme } = useTheme();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // TEXT submission state
    const [textContent, setTextContent] = useState(existingSubmission?.content?.text || '');

    // IMAGE submission state
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [imageDescription, setImageDescription] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);

    // VIDEO submission state
    const [videoUrl, setVideoUrl] = useState(existingSubmission?.content?.videoUrl || '');

    // QUIZ submission state
    const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});

    // FORM submission state
    const [formResponses, setFormResponses] = useState<Record<string, string>>({});

    // PICK_ONE submission state
    const [selectedOption, setSelectedOption] = useState<string>('');

    // CHECKLIST submission state
    const [checkedItems, setCheckedItems] = useState<string[]>([]);

    // Image picker handler
    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need camera roll permissions');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
                aspect: [4, 3],
            });

            if (!result.canceled && result.assets) {
                const uris = result.assets.map(asset => asset.uri);
                setSelectedImages(prev => [...prev, ...uris]);
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick images');
        }
    };

    // Remove image handler
    const handleRemoveImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    // Video URL validation
    const validateVideoUrl = (url: string): boolean => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+$/;
        return youtubeRegex.test(url) || vimeoRegex.test(url);
    };

    // Quiz answer handler
    const handleQuizAnswer = (questionId: string, answer: string) => {
        setQuizAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    // Form response handler
    const handleFormResponse = (fieldId: string, value: string) => {
        setFormResponses(prev => ({ ...prev, [fieldId]: value }));
    };

    // Checklist toggle handler - FIXED
    const handleChecklistToggle = (itemId: string) => {
        console.log('Toggling item:', itemId);
        console.log('Current checked items:', checkedItems);

        setCheckedItems(prev => {
            const isCurrentlyChecked = prev.includes(itemId);
            if (isCurrentlyChecked) {
                // Remove the item
                const newItems = prev.filter(id => id !== itemId);
                console.log('After removal:', newItems);
                return newItems;
            } else {
                // Add the item
                const newItems = [...prev, itemId];
                console.log('After addition:', newItems);
                return newItems;
            }
        });
    };

    // Main submit handler
    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            let content: any = {};
            let files: any[] = [];

            switch (taskType) {
                case 'TEXT':
                    if (!textContent.trim()) {
                        Alert.alert('Error', 'Please enter your response');
                        return;
                    }
                    content = { text: textContent };
                    break;

                case 'IMAGE':
                    if (selectedImages.length === 0) {
                        Alert.alert('Error', 'Please select at least one image');
                        return;
                    }

                    // Upload images to Cloudinary
                    const uploadedUrls: string[] = [];
                    for (let i = 0; i < selectedImages.length; i++) {
                        const progress = ((i + 1) / selectedImages.length) * 100;
                        setUploadProgress(progress);
                        const url = await uploadImageToCloudinary(selectedImages[i]);
                        uploadedUrls.push(url);
                    }

                    files = uploadedUrls.map(url => ({ url }));
                    content = {
                        description: imageDescription,
                        imageCount: selectedImages.length
                    };
                    break;

                case 'VIDEO':
                    if (!videoUrl.trim()) {
                        Alert.alert('Error', 'Please enter a video URL');
                        return;
                    }
                    if (!validateVideoUrl(videoUrl)) {
                        Alert.alert('Error', 'Please enter a valid YouTube or Vimeo URL');
                        return;
                    }
                    content = { videoUrl };
                    break;

                case 'QUIZ':
                    const allQuestionsAnswered = taskOptions?.questions?.every(
                        (q: any) => quizAnswers[q.id]
                    );
                    if (!allQuestionsAnswered) {
                        Alert.alert('Error', 'Please answer all questions');
                        return;
                    }
                    content = { answers: quizAnswers };
                    break;

                case 'FORM':
                    const allFieldsFilled = taskOptions?.fields?.every(
                        (f: any) => !f.required || formResponses[f.id]
                    );
                    if (!allFieldsFilled) {
                        Alert.alert('Error', 'Please fill all required fields');
                        return;
                    }
                    content = { responses: formResponses };
                    break;

                case 'PICK_ONE':
                    if (!selectedOption) {
                        Alert.alert('Error', 'Please select an option');
                        return;
                    }
                    content = { selectedOption };
                    break;

                case 'CHECKLIST':
                    if (checkedItems.length === 0) {
                        Alert.alert('Error', 'Please check at least one item');
                        return;
                    }
                    content = { checkedItems };
                    break;

                default:
                    Alert.alert('Error', 'Unknown task type');
                    return;
            }

            await onSubmit(content, files);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to submit task');
        } finally {
            setIsSubmitting(false);
            setUploadProgress(0);
        }
    };

    // Render different UI based on task type
    const renderSubmissionForm = () => {
        switch (taskType) {
            case 'TEXT':
                return (
                    <View style={styles.formContainer}>
                        <Text style={[styles.label, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                            Your Response
                        </Text>
                        <TextInput
                            style={[styles.textInput, {
                                backgroundColor: theme.backgroundSecondary,
                                color: theme.text,
                                borderColor: theme.border,
                                fontFamily: Fonts.body,
                            }]}
                            placeholder="Type your response here..."
                            placeholderTextColor={theme.textTertiary}
                            multiline
                            numberOfLines={10}
                            value={textContent}
                            onChangeText={setTextContent}
                        />
                    </View>
                );

            case 'IMAGE':
                return (
                    <View style={styles.formContainer}>
                        <Text style={[styles.label, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                            Upload Images
                        </Text>

                        {selectedImages.length > 0 && (
                            <ScrollView horizontal style={styles.imagePreviewContainer}>
                                {selectedImages.map((uri, index) => (
                                    <View key={`image-${index}-${uri}`} style={styles.imagePreview}>
                                        <Image source={{ uri }} style={styles.previewImage} />
                                        <TouchableOpacity
                                            style={[styles.removeImageButton, { backgroundColor: theme.error }]}
                                            onPress={() => handleRemoveImage(index)}
                                        >
                                            <Icon name="x" size={16} color={theme.textInverse} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        )}

                        <Button
                            title={`Pick Images (${selectedImages.length}/5)`}
                            onPress={handlePickImage}
                            variant="outline"
                            icon="image"
                            disabled={selectedImages.length >= 5}
                        />

                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <View style={styles.progressContainer}>
                                <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            { backgroundColor: theme.primary, width: `${uploadProgress}%` }
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.progressText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                                    Uploading... {Math.round(uploadProgress)}%
                                </Text>
                            </View>
                        )}

                        <TextInput
                            style={[styles.descriptionInput, {
                                backgroundColor: theme.backgroundSecondary,
                                color: theme.text,
                                borderColor: theme.border,
                                fontFamily: Fonts.body,
                            }]}
                            placeholder="Add a description (optional)"
                            placeholderTextColor={theme.textTertiary}
                            multiline
                            value={imageDescription}
                            onChangeText={setImageDescription}
                        />
                    </View>
                );

            case 'VIDEO':
                return (
                    <View style={styles.formContainer}>
                        <Text style={[styles.label, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                            Video URL (YouTube or Vimeo)
                        </Text>
                        <TextInput
                            style={[styles.input, {
                                backgroundColor: theme.backgroundSecondary,
                                color: theme.text,
                                borderColor: theme.border,
                                fontFamily: Fonts.body,
                            }]}
                            placeholder="https://youtube.com/watch?v=..."
                            placeholderTextColor={theme.textTertiary}
                            value={videoUrl}
                            onChangeText={setVideoUrl}
                            autoCapitalize="none"
                            keyboardType="url"
                        />
                        <Text style={[styles.helpText, { color: theme.textTertiary, fontFamily: Fonts.body }]}>
                            Paste a link to your video on YouTube or Vimeo
                        </Text>
                    </View>
                );

            case 'QUIZ':
                return (
                    <View style={styles.formContainer}>
                        <Text style={[styles.label, { color: theme.text, fontFamily: Fonts.header }]}>
                            Quiz Questions
                        </Text>
                        {taskOptions?.questions?.map((question: any, index: number) => (
                            <Card key={`question-${question.id}`} style={styles.questionCard}>
                                <Text style={[styles.questionText, { color: theme.text, fontFamily: Fonts.body }]}>
                                    {index + 1}. {question.text}
                                </Text>
                                {question.options?.map((option: string, optionIndex: number) => (
                                    <TouchableOpacity
                                        key={`question-${question.id}-option-${optionIndex}-${option}`}
                                        style={[
                                            styles.optionButton,
                                            {
                                                backgroundColor: quizAnswers[question.id] === option
                                                    ? theme.primaryLight
                                                    : theme.backgroundSecondary,
                                                borderColor: quizAnswers[question.id] === option
                                                    ? theme.primary
                                                    : theme.border,
                                            }
                                        ]}
                                        onPress={() => handleQuizAnswer(question.id, option)}
                                    >
                                        <Text style={[
                                            styles.optionText,
                                            {
                                                color: quizAnswers[question.id] === option
                                                    ? theme.primary
                                                    : theme.text,
                                                fontFamily: Fonts.body,
                                            }
                                        ]}>
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </Card>
                        ))}
                    </View>
                );

            case 'FORM':
                return (
                    <View style={styles.formContainer}>
                        <Text style={[styles.label, { color: theme.text, fontFamily: Fonts.header }]}>
                            Form Fields
                        </Text>
                        {taskOptions?.fields?.map((field: any) => (
                            <View key={`field-${field.id}`} style={styles.fieldContainer}>
                                <Text style={[styles.fieldLabel, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                                    {field.label} {field.required && <Text style={{ color: theme.error }}>*</Text>}
                                </Text>
                                <TextInput
                                    style={[styles.input, {
                                        backgroundColor: theme.backgroundSecondary,
                                        color: theme.text,
                                        borderColor: theme.border,
                                        fontFamily: Fonts.body,
                                    }]}
                                    placeholder={field.placeholder || ''}
                                    placeholderTextColor={theme.textTertiary}
                                    multiline={field.type === 'textarea'}
                                    numberOfLines={field.type === 'textarea' ? 4 : 1}
                                    value={formResponses[field.id] || ''}
                                    onChangeText={(value) => handleFormResponse(field.id, value)}
                                    keyboardType={field.type === 'email' ? 'email-address' : 'default'}
                                />
                            </View>
                        ))}
                    </View>
                );

            case 'PICK_ONE':
                return (
                    <View style={styles.formContainer}>
                        <Text style={[styles.label, { color: theme.text, fontFamily: Fonts.header }]}>
                            Select One Option
                        </Text>
                        {taskOptions?.options?.map((option: any) => (
                            <TouchableOpacity
                                key={`pick-one-${option.id}`}
                                style={[
                                    styles.pickOneCard,
                                    {
                                        backgroundColor: selectedOption === option.id
                                            ? theme.primaryLight
                                            : theme.surface,
                                        borderColor: selectedOption === option.id
                                            ? theme.primary
                                            : theme.border,
                                    }
                                ]}
                                onPress={() => setSelectedOption(option.id)}
                            >
                                <View style={styles.pickOneContent}>
                                    <View style={[
                                        styles.radio,
                                        {
                                            borderColor: selectedOption === option.id ? theme.primary : theme.border,
                                            backgroundColor: selectedOption === option.id ? theme.primary : 'transparent',
                                        }
                                    ]}>
                                        {selectedOption === option.id && (
                                            <View style={[styles.radioInner, { backgroundColor: theme.textInverse }]} />
                                        )}
                                    </View>
                                    <View style={styles.pickOneText}>
                                        <Text style={[styles.optionTitle, { color: theme.text, fontFamily: Fonts.body }]}>
                                            {option.title}
                                        </Text>
                                        {option.description && (
                                            <Text style={[styles.optionDescription, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                                                {option.description}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                );

            case 'CHECKLIST':
                // Debug logging
                console.log('🔍 CHECKLIST Rendering');
                console.log('Task Options:', JSON.stringify(taskOptions, null, 2));
                console.log('Checked Items:', checkedItems);

                const checklistItems = taskOptions?.items || [];

                if (checklistItems.length === 0) {
                    return (
                        <View style={styles.errorContainer}>
                            <Icon name="alert-circle" size={48} color={theme.error} />
                            <Text style={[styles.errorText, { color: theme.error, fontFamily: Fonts.body }]}>
                                No checklist items available
                            </Text>
                        </View>
                    );
                }

                return (
                    <View style={styles.formContainer}>
                        <Text style={[styles.label, { color: theme.text, fontFamily: Fonts.header }]}>
                            Complete the Following
                        </Text>
                        <Text style={[styles.checklistSubtitle, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                            Check off items as you complete them
                        </Text>
                        {checklistItems.map((item: any, index: number) => {
                            // Generate unique ID: use existing ID or create from index and text
                            const itemId = item.id || item._id || `item-${index}-${item.text?.substring(0, 10).replace(/\s+/g, '-')}`;
                            const itemText = item.text || item.title || item.name || `Item ${index + 1}`;
                            const isChecked = checkedItems.includes(itemId);

                            return (
                                <TouchableOpacity
                                    key={`checklist-${index}`}
                                    style={[
                                        styles.checklistItem,
                                        {
                                            borderColor: isChecked ? theme.primary : theme.border,
                                            backgroundColor: isChecked ? theme.primaryLight : theme.surface,
                                        }
                                    ]}
                                    onPress={() => {
                                        console.log('Toggling item:', { index, itemId, itemText });
                                        handleChecklistToggle(itemId);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.checkbox,
                                        {
                                            backgroundColor: isChecked ? theme.primary : 'transparent',
                                            borderColor: isChecked ? theme.primary : theme.border,
                                        }
                                    ]}>
                                        {isChecked && (
                                            <Icon name="check" size={16} color={theme.textInverse} />
                                        )}
                                    </View>
                                    <Text
                                        style={[
                                            styles.checklistText,
                                            {
                                                color: theme.text,
                                                fontFamily: Fonts.body,
                                            }
                                        ]}
                                        numberOfLines={3}
                                    >
                                        {itemText}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}

                        {/* Progress indicator */}
                        <View style={[styles.progressIndicator, { backgroundColor: theme.backgroundSecondary }]}>
                            <Text style={[styles.progressIndicatorText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                                {checkedItems.length} of {checklistItems.length} completed
                            </Text>
                        </View>
                    </View>
                );

            default:
                return (
                    <View style={styles.errorContainer}>
                        <Icon name="alert-circle" size={48} color={theme.error} />
                        <Text style={[styles.errorText, { color: theme.error, fontFamily: Fonts.body }]}>
                            Unsupported task type: {taskType}
                        </Text>
                    </View>
                );
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {renderSubmissionForm()}
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
                <Button
                    title={existingSubmission ? "Update Submission" : "Submit Task"}
                    onPress={handleSubmit}
                    isLoading={isSubmitting}
                    variant="primary"
                    size="lg"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    formContainer: {
        gap: spacing.md,
    },
    label: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
    },
    checklistSubtitle: {
        fontSize: fontSize.sm,
        marginBottom: spacing.md,
        marginTop: -spacing.sm,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        minHeight: 200,
        textAlignVertical: 'top',
    },
    input: {
        borderWidth: 1,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        fontSize: fontSize.base,
    },
    descriptionInput: {
        borderWidth: 1,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        minHeight: 80,
        textAlignVertical: 'top',
        marginTop: spacing.md,
    },
    helpText: {
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
    },
    imagePreviewContainer: {
        marginVertical: spacing.md,
    },
    imagePreview: {
        position: 'relative',
        marginRight: spacing.md,
    },
    previewImage: {
        width: 120,
        height: 120,
        borderRadius: borderRadius.md,
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressContainer: {
        marginTop: spacing.md,
    },
    progressBar: {
        height: 8,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: borderRadius.full,
    },
    progressText: {
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    questionCard: {
        marginBottom: spacing.md,
    },
    questionText: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.md,
    },
    optionButton: {
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        marginBottom: spacing.sm,
    },
    optionText: {
        fontSize: fontSize.base,
    },
    fieldContainer: {
        marginBottom: spacing.md,
    },
    fieldLabel: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
    },
    pickOneCard: {
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        marginBottom: spacing.md,
    },
    pickOneContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    pickOneText: {
        flex: 1,
    },
    optionTitle: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
    },
    optionDescription: {
        fontSize: fontSize.sm,
    },
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        marginBottom: spacing.sm,
        minHeight: 60,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: borderRadius.sm,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
        flexShrink: 0,
        marginTop: 2,
    },
    checklistText: {
        flex: 1,
        fontSize: fontSize.base,
        lineHeight: fontSize.base * 1.5,
    },
    progressIndicator: {
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginTop: spacing.md,
        alignItems: 'center',
    },
    progressIndicatorText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    errorText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginTop: spacing.md,
        textAlign: 'center',
    },
    footer: {
        padding: spacing.lg,
        borderTopWidth: 1,
    },
});