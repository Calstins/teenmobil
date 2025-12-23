// screens/home/ChallengeScreen.tsx - UPDATED WITH PAYSTACK
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { badgeApi } from '../../api/badgeApi';
import { challengeApi } from '../../api/challengeApi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Loading } from '../../components/common/Loading';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, fontSize, fontWeight, spacing, Fonts } from '../../theme';
import { ChallengeDetail } from '../../types';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ChallengeScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const [challengeData, setChallengeData] = useState<ChallengeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>('');
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    fetchChallenge();
  }, []);

  // Listen for app state changes to verify payment on return
  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = ({ url }: { url: string }) => {
    // Handle payment callback
    if (url.includes('payment/callback')) {
      const reference = url.split('reference=')[1]?.split('&')[0];
      if (reference) {
        verifyPayment(reference);
      }
    }
  };

  const fetchChallenge = async () => {
    try {
      const response = await challengeApi.getCurrentChallenge();
      if (response.success && response.data) {
        setChallengeData(response.data);
        const tabs = Object.keys(response.data.tasks);
        if (tabs.length > 0 && !selectedTab) setSelectedTab(tabs[0]);
      }
    } catch (error) {
      console.error('Challenge error:', error);
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
      `Purchase ${challengeData.badge.name} for ₦${challengeData.badge.price}?\n\nYou'll be redirected to Paystack to complete payment.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: async () => {
            setIsPurchasing(true);
            try {
              const response = await badgeApi.initializeBadgePurchase(
                challengeData.badge.id
              );

              if (response.success && response.data) {
                // Open Paystack payment page
                const supported = await Linking.canOpenURL(
                  response.data.authorization_url
                );

                if (supported) {
                  await Linking.openURL(response.data.authorization_url);

                  // Store reference for verification later
                  // You might want to use AsyncStorage here
                  const payReference = response.data?.reference;
                  Alert.alert(
                    'Payment Initiated',
                    'Complete your payment in the browser. When done, return here to verify.',
                    [
                      {
                        text: 'Verify Payment',
                        onPress: () => {
                          if (payReference) {
                            verifyPayment(payReference);
                          } else {
                            Alert.alert('Error', 'No payment reference available for verification.');
                          }
                        },
                      },
                    ]
                  );
                } else {
                  Alert.alert('Error', 'Cannot open payment link');
                }
              }
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message || 'Failed to initialize payment'
              );
            } finally {
              setIsPurchasing(false);
            }
          },
        },
      ]
    );
  };

  const verifyPayment = async (reference: string) => {
    try {
      const response = await badgeApi.verifyBadgePurchase(reference);

      if (response.success) {
        Alert.alert(
          'Success! 🎉',
          `${response.data.badge.name} purchased successfully!`,
          [
            {
              text: 'OK',
              onPress: () => fetchChallenge(), // Refresh to show updated badge status
            },
          ]
        );
      } else {
        Alert.alert('Payment Failed', 'Your payment could not be verified.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to verify payment');
    }
  };

  if (isLoading) return <Loading message="Loading challenge..." />;

  if (!challengeData) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <Icon name="calendar" size={64} color={theme.borderLight} />
        <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
          No active challenge available
        </Text>
      </View>
      </SafeAreaView>
    );
  }

  const tabs = Object.keys(challengeData.tasks);

  return (
     <SafeAreaView style={{ flex: 1 }} edges={['top']}>
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <Text style={[styles.headerTitle, { color: theme.textInverse, fontFamily: Fonts.header }]}>
            {challengeData.challenge.theme}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.primaryLight, fontFamily: Fonts.body }]}>
            {challengeData.challenge.instructions}
          </Text>
        </View>

        <View style={styles.content}>
          <Card variant="elevated" style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressTitle, { color: theme.text, fontFamily: Fonts.header }]}>
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
              {challengeData.progress.tasksCompleted} of {challengeData.progress.tasksTotal} tasks
              completed
            </Text>
          </Card>

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
                  ₦{challengeData.badge.price.toLocaleString()}
                </Text>
                {challengeData.badge.status !== 'AVAILABLE' && (
                  <View style={[styles.statusBadge, {
                    backgroundColor: challengeData.badge.status === 'EARNED'
                      ? theme.successLight
                      : theme.primaryLight
                  }]}>
                    <Text style={[styles.statusText, {
                      color: challengeData.badge.status === 'EARNED'
                        ? theme.success
                        : theme.primary,
                      fontFamily: Fonts.body
                    }]}>
                      {challengeData.badge.status === 'EARNED' ? '✓ Earned' : 'Purchased'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            {challengeData.badge.status === 'AVAILABLE' && (
              <Button
                title={isPurchasing ? "Processing..." : "Purchase with Paystack"}
                onPress={handlePurchaseBadge}
                variant="primary"
                size="sm"
                style={styles.purchaseButton}
                disabled={isPurchasing}
              />
            )}
          </Card>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setSelectedTab(tab)}
                style={[
                  styles.tab,
                  {
                    backgroundColor:
                      selectedTab === tab ? theme.primary : theme.surface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        selectedTab === tab ? theme.textInverse : theme.textSecondary,
                      fontFamily: Fonts.body,
                    },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.tasksContainer}>
            {challengeData.tasks[selectedTab]?.map((task: any) => (
              <Card key={task.id} style={styles.taskCard}>
                <TouchableOpacity
                  onPress={() => router.push(`/task/${task.id}` as any)}
                >
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
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,   
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerTitle: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold,
  },
  headerSubtitle: {
    marginTop: spacing.sm,
    fontSize: fontSize.base,
    paddingBottom: spacing.md
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
    marginTop: spacing.xs,
  },
  badgePrice: {
    fontWeight: fontWeight.bold,
    marginTop: spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
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
    fontWeight: fontWeight.bold,
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
    fontWeight: fontWeight.bold,
    fontSize: fontSize.base,
  },
  taskDescription: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
});

export default ChallengeScreen;