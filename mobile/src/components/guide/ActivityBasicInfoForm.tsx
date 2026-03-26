import React, { useState, useEffect } from 'react'
import { View, Text as RNText, TextInput, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { CreateActivityFormData, Difficulty, ActivityCategory } from '@/types/guide'
import { searchService } from '@/services/searchService'
import { Colors, Spacing, Typography } from '@/constants'
import { useColorScheme } from 'react-native'
import { Button } from '@/components/common'

interface ActivityBasicInfoFormProps {
  initialData?: Partial<CreateActivityFormData>
  onNext: (data: Partial<CreateActivityFormData>) => void
}

export const ActivityBasicInfoForm: React.FC<ActivityBasicInfoFormProps> = ({
  initialData,
  onNext,
}) => {
  const isDark = useColorScheme() === 'dark'
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const category = initialData?.categoryId || ''
  const diff: Difficulty = initialData?.difficulty || 'easy'
  const [categories, setCategories] = useState<ActivityCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isValid = title.trim().length > 0 && description.trim().length > 0 && category && diff

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true)
        const metadata = await searchService.loadMetadata()
        setCategories(metadata.categories || [])
      } catch (err: any) {
        setError(err.message || 'Failed to load categories')
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  const handleNext = () => {
    if (isValid) {
      onNext({
        title: title.trim(),
        description: description.trim(),
        categoryId: category,
        difficulty: diff,
      })
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    header: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
    },
    title: {
      fontSize: Typography.fontSize.lg,
      fontWeight: '700',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.sm,
    },
    subtitle: {
      fontSize: Typography.fontSize.sm,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    progress: {
      height: 2,
      flexDirection: 'row',
      marginBottom: Spacing.lg,
      paddingHorizontal: Spacing.lg,
    },
    progressFill: {
      flex: 1,
      backgroundColor: Colors.primary,
    },
    progressEmpty: {
      flex: 3,
      backgroundColor: isDark ? Colors.dark.border : Colors.light.border,
    },
    form: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.xl,
    },
    field: {
      marginBottom: Spacing.md,
    },
    label: {
      fontSize: Typography.fontSize.sm,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.border : Colors.light.border,
      borderRadius: 8,
      padding: Spacing.md,
      color: isDark ? Colors.dark.text : Colors.light.text,
      backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface,
      fontSize: Typography.fontSize.base,
    },
    textArea: {
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.border : Colors.light.border,
      borderRadius: 8,
      padding: Spacing.md,
      color: isDark ? Colors.dark.text : Colors.light.text,
      backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface,
      fontSize: Typography.fontSize.base,
      minHeight: 120,
      textAlignVertical: 'top',
    },
    select: {
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.border : Colors.light.border,
      borderRadius: 8,
      padding: Spacing.md,
      color: isDark ? Colors.dark.text : Colors.light.text,
      backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface,
      fontSize: Typography.fontSize.base,
    },
    error: {
      color: Colors.error,
      fontSize: Typography.fontSize.sm,
      marginBottom: Spacing.md,
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttons: {
      flexDirection: 'row',
      gap: Spacing.md,
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.lg,
      paddingTop: Spacing.md,
    },
  })

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <RNText style={styles.title}>Create Activity</RNText>
        <RNText style={styles.subtitle}>Step 1 of 4: Basic Information</RNText>
      </View>

      {/* Progress Bar */}
      <View style={styles.progress}>
        <View style={styles.progressFill} />
        <View style={styles.progressEmpty} />
      </View>

      {/* Error */}
      {error && <RNText style={styles.error}>{error}</RNText>}

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <View style={styles.form}>
          {/* Title */}
          <View style={styles.field}>
            <RNText style={styles.label}>Activity Title</RNText>
            <TextInput
              placeholder="e.g., Mountain Hiking Adventure"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              placeholderTextColor={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary}
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <RNText style={styles.label}>Description</RNText>
            <TextInput
              placeholder="Describe your activity in detail..."
              value={description}
              onChangeText={setDescription}
              style={styles.textArea}
              multiline
              numberOfLines={5}
              placeholderTextColor={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary}
            />
          </View>

          {/* Category - Simple picker for now */}
          <View style={styles.field}>
            <RNText style={styles.label}>Category</RNText>
            <View style={styles.select}>
              <RNText style={{ color: category ? (isDark ? Colors.dark.text : Colors.light.text) : (isDark ? Colors.dark.textSecondary : Colors.light.textSecondary) }}>
                {categories.find(c => c.id === category)?.name || 'Select a category'}
              </RNText>
            </View>
          </View>

          {/* Difficulty */}
          <View style={styles.field}>
            <RNText style={styles.label}>Difficulty Level</RNText>
            <View style={styles.select}>
              <RNText style={{ color: isDark ? Colors.dark.text : Colors.light.text }}>
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </RNText>
            </View>
          </View>
        </View>
      )}

      {/* Action Button */}
      <View style={styles.buttons}>
        <Button onPress={handleNext} disabled={!isValid || loading}>
          Next
        </Button>
      </View>
    </ScrollView>
  )
}
