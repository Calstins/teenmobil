// screens/task/TaskSubmissionHandler.tsx - COMPLETE REWRITE
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Feather';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
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

    // Checklist toggle handler
    const handleChecklistToggle = (itemId: string) => {
        setCheckedItems(prev => {
            const isCurrentlyChecked = prev.includes(itemId);
            if (isCurrentlyChecked) {
                return prev.filter(id => id !== itemId);
            } else {
                return [...prev, itemId];
            }
        });
    };

    // Main submit handler
    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            let content: any = {};
            let files: any[] = [];

            console.log('🚀 Starting submission for task type:', taskType);

            switch (taskType) {
                case 'TEXT':
                    if (!textContent || !textContent.trim()) {
                        Alert.alert('Error', 'Please enter your response');
                        setIsSubmitting(false);
                        return;
                    }
                    content = { text: String(textContent).trim() };
                    console.log('📝 TEXT content prepared');
                    break;

                case 'IMAGE':
                    if (!selectedImages || selectedImages.length === 0) {
                        Alert.alert('Error', 'Please select at least one image');
                        setIsSubmitting(false);
                        return;
                    }

                    console.log('📸 Uploading images:', selectedImages.length);
                    
                    try {
                        const uploadedUrls: string[] = [];
                        
                        for (let i = 0; i < selectedImages.length; i++) {
                            const progress = ((i + 1) / selectedImages.length) * 100;
                            setUploadProgress(progress);
                            
                            const url = await uploadImageToCloudinary(selectedImages[i]);
                            
                            if (url && typeof url === 'string') {
                                uploadedUrls.push(url);
                                console.log(`✅ Image ${i + 1} uploaded:`, url);
                            } else {
                                throw new Error(`Failed to upload image ${i + 1}`);
                            }
                        }

                        files = uploadedUrls.map(url => ({ url: String(url) }));
                        content = {
                            description: String(imageDescription || '').trim(),
                            imageCount: uploadedUrls.length
                        };
                        
                        console.log('📸 IMAGE content prepared:', content);
                        console.log('📸 Files prepared:', files.length);
                    } catch (uploadError: any) {
                        console.error('❌ Image upload error:', uploadError);
                        Alert.alert('Upload Failed', uploadError?.message || 'Failed to upload images');
                        setIsSubmitting(false);
                        return;
                    }
                    break;

                case 'VIDEO':
                    if (!videoUrl || !videoUrl.trim()) {
                        Alert.alert('Error', 'Please enter a video URL');
                        setIsSubmitting(false);
                        return;
                    }
                    if (!validateVideoUrl(videoUrl)) {
                        Alert.alert('Error', 'Please enter a valid YouTube or Vimeo URL');
                        setIsSubmitting(false);
                        return;
                    }
                    content = { videoUrl: String(videoUrl).trim() };
                    console.log('🎥 VIDEO content prepared');
                    break;

                case 'QUIZ':
                    const questions = taskOptions?.questions || [];
                    const allQuestionsAnswered = questions.every((q: any) => quizAnswers[q.id]);
                    
                    if (!allQuestionsAnswered) {
                        Alert.alert('Error', 'Please answer all questions');
                        setIsSubmitting(false);
                        return;
                    }
                    
                    const sanitizedAnswers: Record<string, string> = {};
                    Object.keys(quizAnswers).forEach(key => {
                        sanitizedAnswers[String(key)] = String(quizAnswers[key]);
                    });
                    
                    content = { answers: sanitizedAnswers };
                    console.log('🎯 QUIZ content prepared');
                    break;

                case 'FORM':
                    const fields = taskOptions?.fields || [];
                    const allFieldsFilled = fields.every(
                        (f: any) => !f.required || (formResponses[f.id] && String(formResponses[f.id]).trim())
                    );
                    
                    if (!allFieldsFilled) {
                        Alert.alert('Error', 'Please fill all required fields');
                        setIsSubmitting(false);
                        return;
                    }
                    
                    const sanitizedResponses: Record<string, string> = {};
                    Object.keys(formResponses).forEach(key => {
                        sanitizedResponses[String(key)] = String(formResponses[key]).trim();
                    });
                    
                    content = { responses: sanitizedResponses };
                    console.log('📋 FORM content prepared');
                    break;

                case 'PICK_ONE':
                    if (!selectedOption) {
                        Alert.alert('Error', 'Please select an option');
                        setIsSubmitting(false);
                        return;
                    }
                    content = { selectedOption: String(selectedOption) };
                    console.log('☝️ PICK_ONE content prepared');
                    break;

                case 'CHECKLIST':
                    if (!checkedItems || checkedItems.length === 0) {
                        Alert.alert('Error', 'Please check at least one item');
                        setIsSubmitting(false);
                        return;
                    }
                    
                    const sanitizedItems = checkedItems.map(item => String(item));
                    content = { checkedItems: sanitizedItems };
                    console.log('✅ CHECKLIST content prepared');
                    break;

                default:
                    Alert.alert('Error', 'Unknown task type');
                    setIsSubmitting(false);
                    return;
            }

            console.log('📤 Submitting to server...');
            await onSubmit(content, files);
            console.log('✅ Submission successful!');
            
        } catch (error: any) {
            console.error('❌ Submission error:', error);
            
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to submit task';
            Alert.alert('Submission Error', errorMessage);
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
                                    <View key={index} style={styles.imagePreview}>
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
                            <Card key={question.id} style={styles.questionCard}>
                                <Text style={[styles.questionText, { color: theme.text, fontFamily: Fonts.body }]}>
                                    {index + 1}. {question.text}
                                </Text>
                                {question.options?.map((option: string, optionIndex: number) => (
                                    <TouchableOpacity
                                        key={`${question.id}-${optionIndex}`}
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
                            <View key={field.id} style={styles.fieldContainer}>
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
                                key={option.id}
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
                            const itemId = item.id || item._id || `item-${index}`;
                            const itemText = item.text || item.title || item.name || `Item ${index + 1}`;
                            const isChecked = checkedItems.includes(itemId);

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.checklistItem,
                                        {
                                            borderColor: isChecked ? theme.primary : theme.border,
                                            backgroundColor: isChecked ? theme.primaryLight : theme.surface,
                                        }
                                    ]}
                                    onPress={() => handleChecklistToggle(itemId)}
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
         <SafeAreaView style={{ flex: 1 }} edges={['top']}>
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
        </SafeAreaView>
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

export default TaskSubmissionHandler;