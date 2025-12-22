import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const { width } = Dimensions.get('window');

const LOGO_URL = 'https://d64gsuwffb70l.cloudfront.net/6949145e771bf6dd0007c3e0_1766397126688_a5d04e03.jpg';

const slides = [
  {
    id: '1',
    icon: 'wallet',
    title: 'Track Your Finances',
    titleBn: 'আপনার অর্থ ট্র্যাক করুন',
    subtitle: 'Easily manage income and expenses with real-time tracking',
    subtitleBn: 'রিয়েল-টাইম ট্র্যাকিং সহ সহজেই আয় এবং ব্যয় পরিচালনা করুন',
    color: '#1E40AF',
  },
  {
    id: '2',
    icon: 'bar-chart',
    title: 'Detailed Reports',
    titleBn: 'বিস্তারিত রিপোর্ট',
    subtitle: 'Get insights with beautiful charts and financial summaries',
    subtitleBn: 'সুন্দর চার্ট এবং আর্থিক সারাংশ সহ অন্তর্দৃষ্টি পান',
    color: '#10B981',
  },
  {
    id: '3',
    icon: 'business',
    title: 'Multi-Business Support',
    titleBn: 'মাল্টি-বিজনেস সাপোর্ট',
    subtitle: 'Manage multiple businesses with separate financial records',
    subtitleBn: 'পৃথক আর্থিক রেকর্ড সহ একাধিক ব্যবসা পরিচালনা করুন',
    color: '#8B5CF6',
  },
  {
    id: '4',
    icon: 'shield-checkmark',
    title: 'Secure & Private',
    titleBn: 'নিরাপদ এবং গোপনীয়',
    subtitle: 'Your data is protected with PIN lock and biometric security',
    subtitleBn: 'আপনার ডেটা পিন লক এবং বায়োমেট্রিক নিরাপত্তা দ্বারা সুরক্ষিত',
    color: '#EF4444',
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { language, setLanguage, t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const renderSlide = ({ item }: { item: typeof slides[0] }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
        <Ionicons name={item.icon as any} size={80} color={item.color} />
      </View>
      <Text style={styles.slideTitle}>
        {language === 'en' ? item.title : item.titleBn}
      </Text>
      <Text style={styles.slideSubtitle}>
        {language === 'en' ? item.subtitle : item.subtitleBn}
      </Text>
    </View>
  );

  const Pagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
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
                backgroundColor: slides[index].color,
              },
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={{ uri: LOGO_URL }} style={styles.logo} />
          <Text style={styles.appName}>{t('appName')}</Text>
        </View>
        <TouchableOpacity
          style={styles.langBtn}
          onPress={() => setLanguage(language === 'en' ? 'bn' : 'en')}
        >
          <Text style={styles.langText}>{language === 'en' ? 'বাং' : 'EN'}</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* Pagination */}
      <Pagination />

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: slides[currentIndex].color }]}
          onPress={handleNext}
        >
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginRight: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E40AF',
    letterSpacing: 0.5,
  },
  langBtn: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  langText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  skipBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    gap: 8,
  },
  nextText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
