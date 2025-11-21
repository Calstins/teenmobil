// src/screens/profile/HelpSupportScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Linking,
    Alert,
    StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useRouter } from 'expo-router';
import { Card } from '../../components/common/Card';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, Fonts } from '../../theme';

interface FAQItem {
    question: string;
    answer: string;
    icon: string;
}

interface ContactOption {
    title: string;
    description: string;
    icon: string;
    action: () => void;
}

export const HelpSupportScreen: React.FC = () => {
    const router = useRouter();
    const { theme } = useTheme();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const faqs: FAQItem[] = [
        {
            question: 'How do I participate in a challenge?',
            answer: 'Navigate to the Challenges tab, select an active challenge, and complete the tasks. Each task will have specific instructions on what to submit. You can track your progress as you complete each task.',
            icon: 'help-circle',
        },
        {
            question: 'How do I earn badges?',
            answer: 'Complete all required tasks in a monthly challenge to earn that month\'s badge. You can also purchase badges if you prefer. Earned badges appear in your profile and on the leaderboard.',
            icon: 'award',
        },
        {
            question: 'What types of submissions are accepted?',
            answer: 'Depending on the task, you can submit text responses, images, videos, quiz answers, or checklist completions. Check each task for specific requirements and file size limits.',
            icon: 'upload',
        },
        {
            question: 'How is my progress tracked?',
            answer: 'Your progress is automatically tracked as you complete tasks. You can view your overall progress on the Dashboard and individual challenge progress on the Challenges screen. Progress updates in real-time.',
            icon: 'trending-up',
        },
        {
            question: 'What is the leaderboard?',
            answer: 'The leaderboard shows top participants based on completed challenges and earned badges. You must opt-in to public profile in settings to appear on the leaderboard. Your ranking updates automatically.',
            icon: 'bar-chart-2',
        },
        {
            question: 'How do notifications work?',
            answer: 'Enable push notifications in your profile settings to receive updates about new challenges, submission reviews, badge awards, and challenge reminders. You can customize notification preferences anytime.',
            icon: 'bell',
        },
        {
            question: 'Can I edit my submissions?',
            answer: 'Once submitted, you cannot edit a submission directly. However, you can resubmit if needed before the challenge deadline. Each resubmission will replace the previous one.',
            icon: 'edit',
        },
        {
            question: 'What if I forget my password?',
            answer: 'Use the "Recover Password" option in your profile or on the login screen to receive a password reset link via email. The link is valid for 1 hour and can only be used once.',
            icon: 'lock',
        },
        {
            question: 'How do I change my profile picture?',
            answer: 'Go to Edit Profile from your profile screen, tap on your profile picture, and choose to take a new photo or select one from your gallery. Remember to save your changes.',
            icon: 'camera',
        },
        {
            question: 'Is my information private?',
            answer: 'Your personal information is kept private by default. Only your name and progress are visible on the leaderboard if you opt-in to public profile. We never share your email or other personal details.',
            icon: 'shield',
        },
    ];

    const contactOptions: ContactOption[] = [
        {
            title: 'Email Support',
            description: 'Get help via email',
            icon: 'mail',
            action: () => handleEmailSupport(),
        },
        {
            title: 'Visit Website',
            description: 'Learn more about TeenShapers',
            icon: 'globe',
            action: () => handleOpenWebsite(),
        },
        {
            title: 'Privacy Policy',
            description: 'Read our privacy policy',
            icon: 'shield',
            action: () => handleOpenPrivacyPolicy(),
        },
        {
            title: 'Terms of Service',
            description: 'View terms and conditions',
            icon: 'file-text',
            action: () => handleOpenTerms(),
        },
    ];

    const handleEmailSupport = async () => {
        const email = 'support@teenshapers.com';
        const subject = 'TeenShapers Support Request';
        const body = 'Please describe your issue or question:\n\n';
        const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert(
                    'Unable to Open Email',
                    'Please email us at support@teenshapers.com',
                    [
                        {
                            text: 'Copy Email',
                            onPress: () => {
                                // You can implement clipboard copy here if needed
                                Alert.alert('Email Address', 'support@teenshapers.com');
                            },
                        },
                        { text: 'OK' },
                    ]
                );
            }
        } catch (error) {
            Alert.alert(
                'Error',
                'Failed to open email client. Please email us at support@teenshapers.com'
            );
        }
    };

    const handleOpenWebsite = async () => {
        const url = 'https://teenshapersclub.com/';
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Error', 'Unable to open website');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to open website');
        }
    };

    const handleOpenPrivacyPolicy = async () => {
        const url = 'https://teenshapersclub.com/privacy';
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Privacy Policy', 'Privacy policy will be available soon on our website.');
            }
        } catch (error) {
            Alert.alert('Privacy Policy', 'Privacy policy will be available soon on our website.');
        }
    };

    const handleOpenTerms = async () => {
        const url = 'https://teenshapersclub.com/terms';
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Terms of Service', 'Terms of service will be available soon on our website.');
            }
        } catch (error) {
            Alert.alert('Terms of Service', 'Terms of service will be available soon on our website.');
        }
    };

    const toggleFAQ = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Icon name="arrow-left" size={24} color={theme.textInverse} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.textInverse, fontFamily: Fonts.header }]}>
                    Help & Support
                </Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Welcome Message */}
                <Card style={[styles.welcomeCard, { backgroundColor: theme.primaryLight }]}>
                    <View style={styles.welcomeContent}>
                        <Icon name="info" size={24} color={theme.primary} />
                        <View style={styles.welcomeTextContainer}>
                            <Text style={[styles.welcomeTitle, { color: theme.primary, fontFamily: Fonts.header }]}>
                                We're Here to Help!
                            </Text>
                            <Text style={[styles.welcomeText, { color: theme.primary, fontFamily: Fonts.body }]}>
                                Find answers to common questions or reach out to our support team.
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Contact Options */}
                <Card style={styles.card}>
                    <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: Fonts.header }]}>
                        Contact Us
                    </Text>
                    {contactOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.contactOption,
                                { borderBottomColor: theme.borderLight },
                                index === contactOptions.length - 1 && { borderBottomWidth: 0 },
                            ]}
                            onPress={option.action}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                                <Icon name={option.icon} size={20} color={theme.primary} />
                            </View>
                            <View style={styles.contactContent}>
                                <Text style={[styles.contactTitle, { color: theme.text, fontFamily: Fonts.body }]}>
                                    {option.title}
                                </Text>
                                <Text style={[styles.contactDescription, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                                    {option.description}
                                </Text>
                            </View>
                            <Icon name="chevron-right" size={20} color={theme.textTertiary} />
                        </TouchableOpacity>
                    ))}
                </Card>

                {/* FAQs */}
                <Card style={styles.card}>
                    <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: Fonts.header }]}>
                        Frequently Asked Questions
                    </Text>
                    <Text style={[styles.sectionSubtitle, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                        Tap a question to see the answer
                    </Text>
                    {faqs.map((faq, index) => (
                        <View key={index}>
                            <TouchableOpacity
                                style={[
                                    styles.faqItem,
                                    { borderBottomColor: theme.borderLight },
                                    index === faqs.length - 1 && expandedIndex !== index && { borderBottomWidth: 0 },
                                ]}
                                onPress={() => toggleFAQ(index)}
                            >
                                <View style={[styles.faqIconContainer, { backgroundColor: theme.primaryLight }]}>
                                    <Icon name={faq.icon} size={18} color={theme.primary} />
                                </View>
                                <View style={styles.faqContent}>
                                    <Text style={[styles.faqQuestion, { color: theme.text, fontFamily: Fonts.body }]}>
                                        {faq.question}
                                    </Text>
                                </View>
                                <Icon
                                    name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color={theme.textSecondary}
                                />
                            </TouchableOpacity>
                            {expandedIndex === index && (
                                <View style={[styles.faqAnswer, { backgroundColor: theme.backgroundSecondary }]}>
                                    <Text style={[styles.faqAnswerText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                                        {faq.answer}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                </Card>

                {/* Quick Tips */}
                <Card style={styles.card}>
                    <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: Fonts.header }]}>
                        Quick Tips
                    </Text>
                    <View style={styles.tipItem}>
                        <View style={[styles.tipIcon, { backgroundColor: theme.successLight }]}>
                            <Icon name="check" size={16} color={theme.success} />
                        </View>
                        <Text style={[styles.tipText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                            Complete challenges before the deadline to earn badges
                        </Text>
                    </View>
                    <View style={styles.tipItem}>
                        <View style={[styles.tipIcon, { backgroundColor: theme.successLight }]}>
                            <Icon name="check" size={16} color={theme.success} />
                        </View>
                        <Text style={[styles.tipText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                            Enable notifications to never miss important updates
                        </Text>
                    </View>
                    <View style={styles.tipItem}>
                        <View style={[styles.tipIcon, { backgroundColor: theme.successLight }]}>
                            <Icon name="check" size={16} color={theme.success} />
                        </View>
                        <Text style={[styles.tipText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                            Check your dashboard regularly to track your progress
                        </Text>
                    </View>
                    <View style={styles.tipItem}>
                        <View style={[styles.tipIcon, { backgroundColor: theme.successLight }]}>
                            <Icon name="check" size={16} color={theme.success} />
                        </View>
                        <Text style={[styles.tipText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                            Keep your profile information up to date
                        </Text>
                    </View>
                </Card>

                {/* App Info */}
                <Card style={styles.card}>
                    <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: Fonts.header }]}>
                        App Information
                    </Text>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                            Version
                        </Text>
                        <Text style={[styles.infoValue, { color: theme.text, fontFamily: Fonts.body }]}>
                            1.0.0
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                            Build
                        </Text>
                        <Text style={[styles.infoValue, { color: theme.text, fontFamily: Fonts.body }]}>
                            100
                        </Text>
                    </View>
                </Card>

                {/* Footer */}
                <View style={styles.footer}>
                    <Icon name="heart" size={16} color={theme.primary} />
                    <Text style={[styles.footerText, { color: theme.textTertiary, fontFamily: Fonts.body }]}>
                        Made with love for teens
                    </Text>
                    <Text style={[styles.footerText, { color: theme.textTertiary, fontFamily: Fonts.body, marginTop: spacing.sm }]}>
                        © {new Date().getFullYear()} TeenShapers
                    </Text>
                    <Text style={[styles.footerText, { color: theme.textTertiary, fontFamily: Fonts.body }]}>
                        Shaping the future, one teen at a time
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.lg,
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
    },
    headerRight: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    welcomeCard: {
        marginBottom: spacing.lg,
    },
    welcomeContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    welcomeTextContainer: {
        flex: 1,
        marginLeft: spacing.md,
    },
    welcomeTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
    },
    welcomeText: {
        fontSize: fontSize.sm,
        lineHeight: fontSize.sm * 1.4,
    },
    card: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
    },
    sectionSubtitle: {
        fontSize: fontSize.sm,
        marginBottom: spacing.md,
    },
    contactOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactContent: {
        flex: 1,
        marginLeft: spacing.md,
    },
    contactTitle: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.medium,
    },
    contactDescription: {
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
    },
    faqItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
    },
    faqIconContainer: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    faqContent: {
        flex: 1,
        marginLeft: spacing.md,
    },
    faqQuestion: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.medium,
        lineHeight: fontSize.base * 1.4,
    },
    faqAnswer: {
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderRadius: borderRadius.md,
        marginHorizontal: spacing.xs,
    },
    faqAnswerText: {
        fontSize: fontSize.sm,
        lineHeight: fontSize.sm * 1.5,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    tipIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    tipText: {
        flex: 1,
        marginLeft: spacing.sm,
        fontSize: fontSize.sm,
        lineHeight: fontSize.sm * 1.4,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    infoLabel: {
        fontSize: fontSize.base,
    },
    infoValue: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.medium,
    },
    footer: {
        alignItems: 'center',
        marginTop: spacing.lg,
        marginBottom: spacing.md,
    },
    footerText: {
        fontSize: fontSize.sm,
        marginVertical: spacing.xs,
        textAlign: 'center',
    },
});