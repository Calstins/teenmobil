// src/screens/community/CommunityScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    StyleSheet,
    Image,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { useTheme } from '../../context/ThemeContext';
import { communityApi } from '../../api/communityApi';
import { LeaderboardEntry, RecentActivity, CommunityStats } from '../../types';
import { spacing, fontSize, fontWeight, borderRadius, Fonts } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export const CommunityScreen: React.FC = () => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'leaderboard' | 'activity'>('activity');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [stats, setStats] = useState<CommunityStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchCommunityData();
    }, []);

    const fetchCommunityData = async () => {
        try {
            const [leaderboardRes, activityRes, statsRes] = await Promise.all([
                communityApi.getLeaderboard(),
                communityApi.getRecentActivity(20),
                communityApi.getCommunityStats(),
            ]);

            if (leaderboardRes.success && leaderboardRes.data) {
                setLeaderboard(leaderboardRes.data);
            }

            if (activityRes.success && activityRes.data) {
                setActivities(activityRes.data);
            }

            if (statsRes.success && statsRes.data) {
                setStats(statsRes.data);
            }
        } catch (error) {
            console.error('Community data error:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchCommunityData();
    };

    const getActivityIcon = (type: RecentActivity['type']) => {
        switch (type) {
            case 'CHALLENGE_COMPLETED':
                return { name: 'check-circle', color: theme.success };
            case 'BADGE_EARNED':
                return { name: 'award', color: theme.warning };
            case 'TASK_SUBMITTED':
                return { name: 'file-text', color: theme.primary };
            case 'HIGH_PERFORMER':
                return { name: 'trending-up', color: theme.error };
            default:
                return { name: 'activity', color: theme.textSecondary };
        }
    };

    const getTimeAgo = (timestamp: string) => {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffMs = now.getTime() - activityTime.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return activityTime.toLocaleDateString();
    };

    const getRankBadgeColor = (rank: number) => {
        if (rank === 1) return '#FFD700'; // Gold
        if (rank === 2) return '#C0C0C0'; // Silver
        if (rank === 3) return '#CD7F32'; // Bronze
        return theme.borderLight;
    };

    if (isLoading) {
        return <Loading message="Loading community..." />;
    }

    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.primary }]}>
                <Text style={[styles.headerTitle, { color: theme.textInverse, fontFamily: Fonts.header }]}>
                    Community
                </Text>
                <Text style={[styles.headerSubtitle, { color: theme.primaryLight, fontFamily: Fonts.body }]}>
                    See how others are doing!
                </Text>
            </View>

            {/* Stats Banner */}
            {stats && (
                <Card variant="elevated" style={styles.statsCard}>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: theme.primary, fontFamily: Fonts.body }]}>
                                {stats.totalParticipants}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                                Teens Active
                            </Text>
                        </View>
                        {stats.teenRanking && (
                            <>
                                <View style={[styles.statDivider, { backgroundColor: theme.borderLight }]} />
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: theme.success, fontFamily: Fonts.body }]}>
                                        #{stats.teenRanking.rank}
                                    </Text>
                                    <Text style={[styles.statLabel, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                                        Your Rank
                                    </Text>
                                </View>
                                <View style={[styles.statDivider, { backgroundColor: theme.borderLight }]} />
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: theme.warning, fontFamily: Fonts.body }]}>
                                        {Math.round(stats.teenRanking.percentage)}%
                                    </Text>
                                    <Text style={[styles.statLabel, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                                        Progress
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                </Card>
            )}

            {/* Tab Selector */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'activity' && [styles.activeTab, { borderBottomColor: theme.primary }],
                    ]}
                    onPress={() => setActiveTab('activity')}
                >
                    <Icon
                        name="activity"
                        size={20}
                        color={activeTab === 'activity' ? theme.primary : theme.textSecondary}
                    />
                    <Text
                        style={[
                            styles.tabText,
                            { color: activeTab === 'activity' ? theme.primary : theme.textSecondary, fontFamily: Fonts.body },
                        ]}
                    >
                        Activity Feed
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'leaderboard' && [styles.activeTab, { borderBottomColor: theme.primary }],
                    ]}
                    onPress={() => setActiveTab('leaderboard')}
                >
                    <Icon
                        name="trending-up"
                        size={20}
                        color={activeTab === 'leaderboard' ? theme.primary : theme.textSecondary}
                    />
                    <Text
                        style={[
                            styles.tabText,
                            { color: activeTab === 'leaderboard' ? theme.primary : theme.textSecondary, fontFamily: Fonts.body },
                        ]}
                    >
                        Leaderboard
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {activeTab === 'activity' ? (
                    <>
                        {/* FOMO Banner */}
                        <Card style={[styles.fomoCard, { backgroundColor: theme.primaryLight }]}>
                            <View style={styles.fomoContent}>
                                <Icon name="zap" size={24} color={theme.primary} />
                                <View style={styles.fomoText}>
                                    <Text style={[styles.fomoTitle, { color: theme.primary, fontFamily: Fonts.body }]}>
                                        Don't miss out! 🔥
                                    </Text>
                                    <Text style={[styles.fomoSubtitle, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                                        {stats?.totalParticipants || 0} teens are crushing challenges right now
                                    </Text>
                                </View>
                            </View>
                        </Card>

                        {/* Activity Feed */}
                        {activities.length > 0 ? (
                            activities.map((activity, index) => {
                                const iconInfo = getActivityIcon(activity.type);
                                return (
                                    <Card key={activity.id} style={styles.activityCard}>
                                        <View style={styles.activityContent}>
                                            <View style={styles.activityLeft}>
                                                {activity.teen.profilePhoto ? (
                                                    <Image
                                                        source={{ uri: activity.teen.profilePhoto }}
                                                        style={styles.activityAvatar}
                                                    />
                                                ) : (
                                                    <View style={[styles.activityAvatarPlaceholder, { backgroundColor: theme.primaryLight }]}>
                                                        <Icon name="user" size={20} color={theme.primary} />
                                                    </View>
                                                )}
                                                <View style={[styles.activityIconBadge, { backgroundColor: iconInfo.color }]}>
                                                    <Icon name={iconInfo.name} size={12} color={theme.textInverse} />
                                                </View>
                                            </View>

                                            <View style={styles.activityDetails}>
                                                <Text style={[styles.activityName, { color: theme.text, fontFamily: Fonts.body }]}>
                                                    {activity.teen.name}
                                                </Text>
                                                <Text style={[styles.activityMessage, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                                                    {activity.message}
                                                </Text>
                                                <Text style={[styles.activityTime, { color: theme.textTertiary, fontFamily: Fonts.body }]}>
                                                    {getTimeAgo(activity.timestamp)}
                                                </Text>
                                            </View>
                                        </View>
                                    </Card>
                                );
                            })
                        ) : (
                            <Card style={styles.emptyCard}>
                                <Icon name="inbox" size={48} color={theme.borderLight} />
                                <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                                    No recent activity yet
                                </Text>
                            </Card>
                        )}
                    </>
                ) : (
                    <>
                        {/* Leaderboard */}
                        {leaderboard.length > 0 ? (
                            leaderboard.map((entry) => (
                                <Card key={`${entry.rank}`} style={styles.leaderboardCard}>
                                    <View style={styles.leaderboardContent}>
                                        <View style={styles.leaderboardLeft}>
                                            <View
                                                style={[
                                                    styles.rankBadge,
                                                    { backgroundColor: getRankBadgeColor(entry.rank), borderColor: getRankBadgeColor(entry.rank) },
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.rankText,
                                                        {
                                                            color: entry.rank <= 3 ? '#000' : theme.text,
                                                            fontFamily: Fonts.body,
                                                        },
                                                    ]}
                                                >
                                                    {entry.rank}
                                                </Text>
                                            </View>

                                            {entry.teen.profilePhoto ? (
                                                <Image source={{ uri: entry.teen.profilePhoto }} style={styles.leaderboardAvatar} />
                                            ) : (
                                                <View style={[styles.leaderboardAvatarPlaceholder, { backgroundColor: theme.primaryLight }]}>
                                                    <Icon name="user" size={24} color={theme.primary} />
                                                </View>
                                            )}

                                            <View style={styles.leaderboardInfo}>
                                                <Text style={[styles.leaderboardName, { color: theme.text, fontFamily: Fonts.body }]}>
                                                    {entry.teen.name}
                                                </Text>
                                                <Text style={[styles.leaderboardProgress, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                                                    {entry.tasksCompleted}/{entry.tasksTotal} tasks
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.leaderboardRight}>
                                            <View
                                                style={[
                                                    styles.percentageBadge,
                                                    {
                                                        backgroundColor: entry.percentage === 100 ? theme.successLight : theme.primaryLight,
                                                    },
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.percentageText,
                                                        {
                                                            color: entry.percentage === 100 ? theme.success : theme.primary,
                                                            fontFamily: Fonts.body,
                                                        },
                                                    ]}
                                                >
                                                    {Math.round(entry.percentage)}%
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </Card>
                            ))
                        ) : (
                            <Card style={styles.emptyCard}>
                                <Icon name="users" size={48} color={theme.borderLight} />
                                <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                                    Leaderboard coming soon!
                                </Text>
                                <Text style={[styles.emptySubtext, { color: theme.textTertiary, fontFamily: Fonts.body }]}>
                                    Complete challenges to appear here
                                </Text>
                            </Card>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,   
        paddingBottom: spacing.xl,
        borderBottomLeftRadius: borderRadius.xl,
        borderBottomRightRadius: borderRadius.xl,
    },
    headerTitle: {
        fontSize: fontSize['3xl'],
        fontWeight: fontWeight.extrabold,
    },
    headerSubtitle: {
        marginTop: spacing.xs,
        fontSize: fontSize.base,
        paddingBottom: spacing.md
    },
    statsCard: {
        marginHorizontal: spacing.lg,
        marginTop: -spacing.lg,
        marginBottom: spacing.md,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: fontSize['2xl'],
        fontWeight: fontWeight.bold,
    },
    statLabel: {
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
    },
    statDivider: {
        width: 1,
        height: 40,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomWidth: 3,
    },
    tabText: {
        marginLeft: spacing.sm,
        fontWeight: fontWeight.semibold,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
    fomoCard: {
        marginBottom: spacing.lg,
    },
    fomoContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fomoText: {
        marginLeft: spacing.md,
        flex: 1,
    },
    fomoTitle: {
        fontWeight: fontWeight.bold,
        fontSize: fontSize.base,
    },
    fomoSubtitle: {
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
    },
    activityCard: {
        marginBottom: spacing.md,
    },
    activityContent: {
        flexDirection: 'row',
    },
    activityLeft: {
        position: 'relative',
    },
    activityAvatar: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
    },
    activityAvatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityIconBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activityDetails: {
        marginLeft: spacing.md,
        flex: 1,
    },
    activityName: {
        fontWeight: fontWeight.bold,
        fontSize: fontSize.base,
    },
    activityMessage: {
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
        lineHeight: fontSize.sm * 1.4,
    },
    activityTime: {
        fontSize: fontSize.xs,
        marginTop: spacing.xs,
    },
    leaderboardCard: {
        marginBottom: spacing.md,
    },
    leaderboardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leaderboardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rankBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    rankText: {
        fontWeight: fontWeight.bold,
        fontSize: fontSize.base,
    },
    leaderboardAvatar: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.full,
        marginRight: spacing.md,
    },
    leaderboardAvatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    leaderboardInfo: {
        flex: 1,
    },
    leaderboardName: {
        fontWeight: fontWeight.bold,
        fontSize: fontSize.base,
    },
    leaderboardProgress: {
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
    },
    leaderboardRight: {},
    percentageBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
    },
    percentageText: {
        fontWeight: fontWeight.bold,
        fontSize: fontSize.base,
    },
    emptyCard: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyText: {
        marginTop: spacing.md,
        fontWeight: fontWeight.semibold,
    },
    emptySubtext: {
        marginTop: spacing.sm,
        fontSize: fontSize.sm,
    },
});