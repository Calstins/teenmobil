// app/challenge/[id].tsx 
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { badgeApi } from '../../api/badgeApi';
import { challengeApi } from '../../api/challengeApi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, fontSize, fontWeight, spacing, Fonts } from '../../theme';
import { ChallengeDetail } from '../../types';

export default function ChallengeDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const challengeId = id;
    const { theme } = useTheme();

    const [challengeData, setChallengeData] = useState<ChallengeDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTab, setSelectedTab] = useState<string>('');

    useEffect(() => {
        if (challengeId) {
            fetchChallenge();
        }
    }, [challengeId]);

    const fetchChallenge = async () => {
        try {
            const response = await challengeApi.getChallengeById(challengeId);
            if (response.success && response.data) {
                setChallengeData(response.data);
                const tabs = Object.keys(response.data.tasks);
                if (tabs.length > 0 && !selectedTab) setSelectedTab(tabs[0]);
            }
        } catch (error) {
            console.error('Challenge error:', error);
            Alert.alert('Error', 'Failed to load challenge');
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchChallenge();
    };

    const handlePurchaseBadge = async () => {
        if (!challengeData?.badge) return;

        // ✅ NEW: Show different message for past challenges
        const isPast = Boolean((challengeData?.challenge as any)?.isPastChallenge);
        const warningMessage = isPast
            ? `This challenge has ended. Purchase ${challengeData.badge.name} for ₦${challengeData.badge.price}? This will be marked as a late purchase.`
            : `Purchase ${challengeData.badge.name} for ₦${challengeData.badge.price}?`;

        Alert.alert(
            'Purchase Badge',
            warningMessage,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Purchase',
                    onPress: async () => {
                        try {
                            const result = await badgeApi.initializeBadgePurchase(challengeData.badge.id);
                            if (result.success && result.data?.authorization_url) {
                                Alert.alert(
                                    'Payment Initialized',
                                    'A payment link has been generated; please complete the payment to finish purchasing the badge.'
                                );
                                // Optionally open the returned authorization_url in a browser/webview here
                            } else {
                                Alert.alert('Success', 'Badge purchase initialized. You will be notified once payment is verified.');
                            }
                            fetchChallenge();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to initialize badge purchase');
                        }
                    },
                },
            ]
        );
    };

    if (isLoading) return <Loading message="Loading challenge..." />;

    if (!challengeData) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
                <Icon name="calendar" size={64} color={theme.borderLight} />
                <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                    Challenge not found
                </Text>
                <Button
                    title="Go Back"
                    onPress={() => router.back()}
                    style={{ marginTop: spacing.md }}
                />
            </View>
        );
    }

    const tabs = Object.keys(challengeData.tasks);
    const isPastChallenge = Boolean((challengeData.challenge as any)?.isPastChallenge);

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={theme.textInverse} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={[styles.headerTitle, { color: theme.textInverse, fontFamily: Fonts.header }]}>
                        {challengeData.challenge.theme}
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: theme.primaryLight, fontFamily: Fonts.body }]}>
                        {challengeData.challenge.instructions}
                    </Text>
                </View>
            </View>

            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <View style={styles.content}>
                    {/* ✅ NEW: Past Challenge Warning */}
                    {isPastChallenge && (
                        <Card style={[styles.warningCard, { backgroundColor: theme.warningLight }]}>
                            <View style={styles.warningRow}>
                                <Icon name="clock" size={20} color={theme.warning} />
                                <View style={styles.warningText}>
                                    <Text style={[styles.warningTitle, { color: theme.warning, fontFamily: Fonts.body }]}>
                                        Past Challenge
                                    </Text>
                                    <Text style={[styles.warningSubtitle, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                                        This challenge has ended. You can still complete tasks and purchase the badge,
                                        but it will be marked as completed after the deadline.
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    )}

                    {/* Progress Card */}
                    <Card variant="elevated" style={styles.progressCard}>
                        <View style={styles.progressHeader}>
                            <Text style={[styles.progressTitle, { color: theme.text, fontFamily: Fonts.body }]}>
                                Your Progress
                            </Text>
                            <Text style={[styles.progressPercentage, { color: theme.primary, fontFamily: Fonts.body }]}>
                                {Math.round(challengeData.progress.percentage)}%
                            </Text>
                        </View>
                        <View style={[styles.progressBarContainer, { backgroundColor: theme.backgroundSecondary }]}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        backgroundColor: theme.primary,
                                        width: `${challengeData.progress.percentage}%`,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={[styles.progressStats, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                            {challengeData.progress.tasksCompleted} of {challengeData.progress.tasksTotal} tasks completed
                        </Text>
                    </Card>

                    {/* Badge Card */}
                    {challengeData.badge && (
                        <Card style={styles.badgeCard}>
                            <View style={styles.badgeRow}>
                                <View style={[styles.badgeIconBox, { backgroundColor: theme.primaryLight }]}>
                                    <Icon name="award" size={32} color={theme.primary} />
                                </View>
                                <View style={styles.badgeInfo}>
                                    <Text style={[styles.badgeName, { color: theme.text, fontFamily: Fonts.body }]}>
                                        {challengeData.badge.name}
                                    </Text>
                                    <Text style={[styles.badgeDescription, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                                        {challengeData.badge.description}
                                    </Text>
                                    <Text style={[styles.badgePrice, { color: theme.primary, fontFamily: Fonts.body }]}>
                                        ₦{challengeData.badge.price}
                                    </Text>
                                </View>
                            </View>
                            {challengeData.badge.status !== 'PURCHASED' && (
                                <Button
                                    title={isPastChallenge ? "Purchase Badge (Late)" : "Purchase Badge"}
                                    onPress={handlePurchaseBadge}
                                    variant="primary"
                                    size="sm"
                                    style={styles.purchaseButton}
                                />
                            )}
                            {challengeData.badge.status === 'PURCHASED' && (
                                <View style={[styles.badgeStatus, { backgroundColor: theme.primaryLight }]}>
                                    <Icon name="check-circle" size={16} color={theme.primary} />
                                    <Text style={[styles.badgeStatusText, { color: theme.primary, fontFamily: Fonts.body }]}>
                                        Purchased
                                    </Text>
                                </View>
                            )}
                        </Card>
                    )}

                    {/* Tabs */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
                        {tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setSelectedTab(tab)}
                                style={[
                                    styles.tab,
                                    {
                                        backgroundColor: selectedTab === tab ? theme.primary : theme.surface,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        {
                                            color: selectedTab === tab ? theme.textInverse : theme.textSecondary,
                                            fontFamily: Fonts.body,
                                        },
                                    ]}
                                >
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Tasks */}
                    <View style={styles.tasksContainer}>
                        {challengeData.tasks[selectedTab]?.map((task: any) => (
                            <Card key={task.id} style={styles.taskCard}>
                                <TouchableOpacity onPress={() => router.push(`/task/${task.id}` as any)}>
                                    <View style={styles.taskRow}>
                                        <View style={styles.taskContent}>
                                            <Text style={[styles.taskTitle, { color: theme.text, fontFamily: Fonts.body }]}>
                                                {task.title}
                                            </Text>
                                            <Text
                                                style={[styles.taskDescription, { color: theme.textSecondary, fontFamily: Fonts.body }]}
                                                numberOfLines={2}
                                            >
                                                {task.description}
                                            </Text>
                                            {task.submission && (
                                                <View style={styles.statusRow}>
                                                    <View style={[styles.statusBadge, { backgroundColor: theme.successLight }]}>
                                                        <Icon name="check" size={12} color={theme.secondary} />
                                                        <Text style={[styles.statusText, { color: theme.secondary, fontFamily: Fonts.body }]}>
                                                            Completed
                                                        </Text>
                                                    </View>
                                                    {/* ✅ NEW: Show late indicator */}
                                                    {task.submission.submittedLate && (
                                                        <View style={[styles.lateIndicator, { backgroundColor: theme.warningLight }]}>
                                                            <Icon name="clock" size={10} color={theme.warning} />
                                                            <Text style={[styles.lateText, { color: theme.warning, fontFamily: Fonts.body }]}>
                                                                Late
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                        <Icon name="chevron-right" size={20} color={theme.textTertiary} />
                                    </View>
                                </TouchableOpacity>
                            </Card>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

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
        marginVertical: spacing.md,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.lg,
    },
    backButton: {
        marginBottom: spacing.md,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
    },
    headerSubtitle: {
        marginTop: spacing.sm,
        fontSize: fontSize.base,
    },
    content: {
        paddingHorizontal: spacing.lg,
    },
    // ✅ NEW: Warning card styles
    warningCard: {
        marginTop: -spacing.lg,
        marginBottom: spacing.md,
    },
    warningRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    warningText: {
        flex: 1,
        marginLeft: spacing.md,
    },
    warningTitle: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.xs,
    },
    warningSubtitle: {
        fontSize: fontSize.sm,
        lineHeight: fontSize.sm * 1.5,
    },
    progressCard: {
        marginTop: -spacing.lg,
        marginBottom: spacing.lg,
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    progressTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    progressPercentage: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
    },
    progressBarContainer: {
        height: 16,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: borderRadius.full,
    },
    progressStats: {
        fontSize: fontSize.sm,
        marginTop: spacing.sm,
    },
    badgeCard: {
        marginBottom: spacing.lg,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badgeIconBox: {
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginRight: spacing.md,
    },
    badgeInfo: {
        flex: 1,
    },
    badgeName: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
    },
    badgeDescription: {
        fontSize: fontSize.sm,
    },
    badgePrice: {
        fontWeight: fontWeight.bold,
        marginTop: spacing.xs,
    },
    purchaseButton: {
        marginTop: spacing.md,
    },
    badgeStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        alignSelf: 'flex-start',
        marginTop: spacing.md,
        gap: spacing.xs,
    },
    badgeStatusText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
    },
    tabsContainer: {
        marginBottom: spacing.md,
    },
    tab: {
        marginRight: spacing.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
    },
    tabText: {
        fontWeight: fontWeight.semibold,
    },
    tasksContainer: {
        marginBottom: spacing.lg,
    },
    taskCard: {
        marginBottom: spacing.md,
    },
    taskRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    taskContent: {
        flex: 1,
        marginRight: spacing.md,
    },
    taskTitle: {
        fontWeight: fontWeight.semibold,
        fontSize: fontSize.base,
    },
    taskDescription: {
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
        gap: spacing.sm,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    statusText: {
        fontSize: fontSize.xs,
        marginLeft: spacing.xs,
        fontWeight: fontWeight.semibold,
    },
    // ✅ NEW: Late indicator styles
    lateIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        gap: spacing.xs,
    },
    lateText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semibold,
    },
});