import React, { useMemo } from 'react'
import { ScrollView, Text, StyleSheet, useColorScheme, TextInput, View, TouchableOpacity } from 'react-native'
import { Colors, Spacing, Typography } from '@/constants'
import { Input, Card } from '@/components/common'
import { CategoryMultiSelect } from './CategoryMultiSelect'

interface EventWizardStep1Props {
  title: string
  description: string
  categoryIds: string[] // Multi-category support
  categories: Array<{ id: string; name: string }>
  onTitleChange: (text: string) => void
  onDescriptionChange: (text: string) => void
  onCategoryChange: (categoryIds: string[]) => void // Array instead of single value
  isLoading?: boolean
}

export const EventWizardStep1: React.FC<EventWizardStep1Props> = ({
  title,
  description,
  categoryIds,
  categories,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  isLoading = false,
}) => {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light
  const styles = createStyles(theme)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.stepTitle}>Event Details</Text>
      <Text style={styles.stepDescription}>
        Tell us about your event. You can select multiple categories. You can always edit these details later.
      </Text>

      {/* Event Name Input */}
      <View style={styles.section}>
        <Text style={styles.label}>Event Name *</Text>
        <Input
          placeholder="Enter event name"
          value={title}
          onChangeText={onTitleChange}
          editable={!isLoading}
          maxLength={100}
          placeholderTextColor={theme.grayText}
          style={styles.input}
        />
        <Text style={styles.helperText}>{title.length}/100</Text>
      </View>

      {/* Multi-Category Selection */}
      <View style={styles.section}>
        <Text style={styles.label}>Activity Categories * (Select one or more)</Text>
        <View style={styles.categoryContainer}>
          <CategoryMultiSelect
            selectedCategoryIds={categoryIds}
            onSelectionChange={onCategoryChange}
            placeholder="Search Alternative Tourism categories..."
          />
        </View>
      </View>

      {/* Description Input */}
      <View style={styles.section}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          placeholder="Describe your event in detail. Include guidelines, expectations, what to bring, etc."
          value={description}
          onChangeText={onDescriptionChange}
          editable={!isLoading}
          multiline
          numberOfLines={6}
          maxLength={2000}
          placeholderTextColor={theme.grayText}
          style={styles.descriptionInput}
        />
        <Text style={styles.helperText}>{description.length}/2000</Text>
      </View>

      {/* Tips Card */}
      <Card style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Pro Tips:</Text>
        <Text style={styles.tipText}>• Select all relevant categories to reach more people</Text>
        <Text style={styles.tipText}>• Be clear about what attendees will be doing</Text>
        <Text style={styles.tipText}>• Mention any requirements or restrictions</Text>
        <Text style={styles.tipText}>• Describe the experience, not just the activity</Text>
      </Card>
    </ScrollView>
  )
}

const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: Spacing.lg,
      paddingBottom: Spacing.xl,
    },
    stepTitle: {
      fontSize: Typography.fontSize.title,
      fontWeight: '600',
      color: theme.text,
      marginBottom: Spacing.xs,
    },
    stepDescription: {
      fontSize: Typography.fontSize.body,
      color: theme.grayText,
      marginBottom: Spacing.lg,
      lineHeight: 20,
    },
    section: {
      marginBottom: Spacing.xl,
    },
    label: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
      color: theme.text,
      marginBottom: Spacing.sm,
    },
    input: {
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: Spacing.md,
      fontSize: Typography.fontSize.body,
      color: theme.text,
      minHeight: 48,
    },
    helperText: {
      fontSize: Typography.fontSize.small,
      color: theme.grayText,
      marginTop: Spacing.xs,
      textAlign: 'right',
    },
    categoryContainer: {
      minHeight: 300,
      maxHeight: 500,
      borderRadius: 12,
      overflow: 'hidden',
    },
    descriptionInput: {
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: Spacing.md,
      fontSize: Typography.fontSize.body,
      color: theme.text,
      textAlignVertical: 'top',
      minHeight: 120,
    },
    tipsCard: {
      backgroundColor: theme.surface,
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
      marginTop: Spacing.lg,
    },
    tipsTitle: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
      color: theme.text,
      marginBottom: Spacing.sm,
    },
    tipText: {
      fontSize: Typography.fontSize.small,
      color: theme.grayText,
      marginBottom: Spacing.xs,
      lineHeight: 18,
    },
  })
