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
import { borderRadius, fontSize, fontWeight, spacing } from '../../theme';
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
        Alert.alert(
            'Purchase Badge',
            `Purchase ${challengeData.badge.name} for $${challengeData.badge.price}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Purchase',
                    onPress: async () => {
                        try {
                            await badgeApi.purchaseBadge(challengeData.badge.id);
                            Alert.alert('Success', 'Badge purchased successfully!');
                            fetchChallenge();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'Failed to purchase badge');
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
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
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

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={theme.textInverse} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={[styles.headerTitle, { color: theme.textInverse }]}>
                        {challengeData.challenge.theme}
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: theme.primaryLight }]}>
                        {challengeData.challenge.instructions}
                    </Text>
                </View>
            </View>

            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <View style={styles.content}>
                    {/* Progress Card */}
                    <Card variant="elevated" style={styles.progressCard}>
                        <View style={styles.progressHeader}>
                            <Text style={[styles.progressTitle, { color: theme.text }]}>Your Progress</Text>
                            <Text style={[styles.progressPercentage, { color: theme.primary }]}>
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
                        <Text style={[styles.progressStats, { color: theme.textSecondary }]}>
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
                                    <Text style={[styles.badgeName, { color: theme.text }]}>
                                        {challengeData.badge.name}
                                    </Text>
                                    <Text style={[styles.badgeDescription, { color: theme.textSecondary }]}>
                                        {challengeData.badge.description}
                                    </Text>
                                    <Text style={[styles.badgePrice, { color: theme.primary }]}>
                                        ${challengeData.badge.price}
                                    </Text>
                                </View>
                            </View>
                            {challengeData.badge.status === 'AVAILABLE' && (
                                <Button
                                    title="Purchase Badge"
                                    onPress={handlePurchaseBadge}
                                    variant="primary"
                                    size="sm"
                                    style={styles.purchaseButton}
                                />
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
                                            <Text style={[styles.taskTitle, { color: theme.text }]}>{task.title}</Text>
                                            <Text
                                                style={[styles.taskDescription, { color: theme.textSecondary }]}
                                                numberOfLines={2}
                                            >
                                                {task.description}
                                            </Text>
                                            {task.submission && (
                                                <View style={[styles.statusBadge, { backgroundColor: theme.successLight }]}>
                                                    <Icon name="check" size={12} color={theme.secondary} />
                                                    <Text style={[styles.statusText, { color: theme.secondary }]}>
                                                        Completed
                                                    </Text>
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
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        alignSelf: 'flex-start',
        marginTop: spacing.sm,
    },
    statusText: {
        fontSize: fontSize.xs,
        marginLeft: spacing.xs,
        fontWeight: fontWeight.semibold,
    },
});