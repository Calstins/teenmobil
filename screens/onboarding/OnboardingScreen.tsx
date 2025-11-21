// screens/onboarding/OnboardingScreen.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import { Button } from '../../components/common/Button';
import { useTheme } from '../../context/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, Fonts } from '../../theme';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Welcome to TeenShapers! 🎉',
    description: 'Discover exciting monthly challenges designed to help you grow spiritually, mentally, and socially.',
    image: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=800&h=600&fit=crop',
    gradient: ['#FF6B35', '#FF946B'] as const,
  },
  {
    id: 2,
    title: 'Complete Fun Challenges 🚀',
    description: 'Engage in Bible studies, read inspiring books, participate in activities, and work on exciting projects!',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
    gradient: ['#FF946B', '#FFBFA9'] as const,
  },
  {
    id: 3,
    title: 'Earn Badges & Rewards 🏆',
    description: 'Complete challenges to earn cool badges and enter our annual raffle for amazing prizes!',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=600&fit=crop',
    gradient: ['#FFBFA9', '#FFD6C7'] as const,
  },
  {
    id: 4,
    title: 'Join Our Community 💪',
    description: 'Connect with teens from around the world who are growing in faith and character together!',
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop',
    gradient: ['#FFD6C7', '#FFEBE4'] as const,
  },
];

export const OnboardingScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
      },
    }
  );

  const scrollToNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: width * (currentIndex + 1),
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const skipOnboarding = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(auth)/login');
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(auth)/register');
  };

  const handleLogin = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      {currentIndex < onboardingData.length - 1 && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={skipOnboarding}
        >
          <Text style={[styles.skipText, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
            Skip
          </Text>
        </TouchableOpacity>
      )}

      {/* Animated Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {onboardingData.map((item) => (
          <View key={item.id} style={styles.slide}>
            <LinearGradient
              colors={item.gradient}
              style={styles.gradient}
            >
              {/* Image */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay} />
              </View>

              {/* Content */}
              <View style={styles.content}>
                <Text style={[styles.title, { fontFamily: Fonts.header }]}>
                  {item.title}
                </Text>
                <Text style={[styles.description, { fontFamily: Fonts.body }]}>
                  {item.description}
                </Text>
              </View>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Section */}
      <View style={[styles.bottomSection, { backgroundColor: theme.background }]}>
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                    backgroundColor: theme.primary,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {currentIndex === onboardingData.length - 1 ? (
            <>
              <Button
                title="Get Started"
                onPress={handleGetStarted}
                variant="primary"
                style={styles.button}
              />
              <Button
                title="I Have an Account"
                onPress={handleLogin}
                variant="outline"
                style={styles.button}
              />
            </>
          ) : (
            <Button
              title="Next"
              onPress={scrollToNext}
              variant="primary"
              style={styles.button}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: spacing.lg,
    zIndex: 10,
    padding: spacing.sm,
  },
  skipText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
  slide: {
    width,
    height: height * 0.7,
  },
  gradient: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.extrabold,
    color: '#fff',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSize.lg,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
  },
  bottomSection: {
    height: height * 0.3,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    marginTop: -20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  actionButtons: {
    gap: spacing.md,
  },
  button: {
    width: '100%',
  },
});

export default OnboardingScreen;