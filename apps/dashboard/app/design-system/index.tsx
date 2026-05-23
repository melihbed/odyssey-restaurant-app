import React, { useState } from 'react'
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import {
  Avatar, Badge, Button, Card, colors, DataTable, EmptyState, ErrorState, fontSizes,
  fontWeights, AppModal, Input, Skeleton, SkeletonCard, spacing, StatusBadge,
  palette, radius, shadows, Select, useToast,
} from '@repo/ui'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={ds.section}>
    <Text style={ds.sectionTitle}>{title}</Text>
    {children}
  </View>
)

const Row = ({ children, wrap = false }: { children: React.ReactNode; wrap?: boolean }) => (
  <View style={[ds.row, wrap && ds.rowWrap]}>{children}</View>
)

const Label = ({ children }: { children: string }) => (
  <Text style={ds.label}>{children}</Text>
)

const DEMO_TABLE_DATA = [
  { id: '1', name: 'Margherita Pizza', orders: 142, price: '$14.99' },
  { id: '2', name: 'Caesar Salad', orders: 98, price: '$11.50' },
  { id: '3', name: 'Tiramisu', orders: 76, price: '$8.00' },
]

export default function DesignSystemScreen() {
  const router = useRouter()
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const [selectVal, setSelectVal] = useState<string | undefined>()

  return (
    <SafeAreaView style={ds.safe}>
      <View style={ds.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={ds.back}>← Back</Text>
        </Pressable>
        <Text style={ds.title}>Design System</Text>
      </View>

      <ScrollView style={ds.scroll} contentContainerStyle={ds.content}>

        {/* ── Colors ──────────────────────────────────── */}
        <Section title="Color Palette">
          {(['primary', 'neutral', 'success', 'warning', 'error'] as const).map((name) => (
            <View key={name} style={ds.colorRow}>
              <Label>{name}</Label>
              <View style={ds.swatchRow}>
                {Object.entries(palette[name] ?? {}).map(([shade, hex]) => (
                  <View key={shade} style={[ds.swatch, { backgroundColor: hex as string }]}>
                    <Text style={ds.swatchLabel}>{shade}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </Section>

        {/* ── Semantic Colors ──────────────────────────── */}
        <Section title="Semantic Colors">
          <View style={ds.swatchRow}>
            {Object.entries({
              brand: colors.brand, bgDefault: colors.bgDefault, bgSurface: colors.bgSurface,
              textPrimary: colors.textPrimary, textSecondary: colors.textSecondary,
              borderDefault: colors.borderDefault,
            }).map(([name, hex]) => (
              <View key={name} style={ds.semanticSwatch}>
                <View style={[ds.semanticColor, { backgroundColor: hex, borderWidth: 1, borderColor: colors.borderDefault }]} />
                <Text style={ds.semanticLabel}>{name}</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* ── Typography ──────────────────────────────── */}
        <Section title="Typography">
          {Object.entries(fontSizes).map(([size, px]) => (
            <Text key={size} style={{ fontSize: px, color: colors.textPrimary, marginBottom: 4 }}>
              {size} — {px}px — The quick brown fox
            </Text>
          ))}
          <View style={{ marginTop: spacing[3], gap: spacing[1] }}>
            {Object.entries(fontWeights).map(([name, w]) => (
              <Text key={name} style={{ fontSize: 15, fontWeight: w as any, color: colors.textPrimary }}>
                {name} ({w}) — Restaurant Operations
              </Text>
            ))}
          </View>
        </Section>

        {/* ── Spacing ─────────────────────────────────── */}
        <Section title="Spacing Scale">
          <View style={{ gap: 6 }}>
            {Object.entries(spacing).map(([key, px]) => (
              <View key={key} style={ds.spacingRow}>
                <Text style={ds.spacingLabel}>{key} → {px}px</Text>
                <View style={{ width: px, height: 16, backgroundColor: colors.brand, borderRadius: 2, minWidth: 2 }} />
              </View>
            ))}
          </View>
        </Section>

        {/* ── Border Radius ────────────────────────────── */}
        <Section title="Border Radius">
          <Row wrap>
            {Object.entries(radius).map(([name, r]) => (
              <View key={name} style={ds.radiusSwatch}>
                <View style={{ width: 48, height: 48, backgroundColor: colors.brandLight, borderRadius: r, borderWidth: 1, borderColor: colors.brand }} />
                <Text style={ds.spacingLabel}>{name}</Text>
              </View>
            ))}
          </Row>
        </Section>

        {/* ── Shadows ──────────────────────────────────── */}
        <Section title="Elevation / Shadows">
          <Row>
            {(['sm', 'md', 'lg'] as const).map((s) => (
              <View key={s} style={[ds.shadowCard, shadows[s]]}>
                <Text style={ds.label}>{s}</Text>
              </View>
            ))}
          </Row>
        </Section>

        {/* ── Buttons ──────────────────────────────────── */}
        <Section title="Buttons">
          <Label>Variants</Label>
          <Row wrap>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </Row>
          <Label>Sizes</Label>
          <Row>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Row>
          <Label>States</Label>
          <Row wrap>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </Row>
        </Section>

        {/* ── Inputs ───────────────────────────────────── */}
        <Section title="Form Controls">
          <Input label="Default Input" value={inputVal} onChangeText={setInputVal} placeholder="Type something…" />
          <Input label="With Error" value="" onChangeText={() => {}} error="This field is required" />
          <Input label="With Hint" value="" onChangeText={() => {}} hint="We'll never share your email" placeholder="email@example.com" />
          <Input label="Multiline" value="" onChangeText={() => {}} multiline placeholder="Write a long note…" />
          <Select
            label="Select"
            placeholder="Choose a category"
            options={[
              { label: 'Appetizers', value: 'app' },
              { label: 'Main Courses', value: 'main' },
              { label: 'Desserts', value: 'des' },
            ]}
            value={selectVal}
            onChange={setSelectVal}
          />
        </Section>

        {/* ── Badges ───────────────────────────────────── */}
        <Section title="Badges">
          <Label>Generic</Label>
          <Row wrap>
            <Badge variant="default">Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
          </Row>
          <Label>Order Status</Label>
          <Row wrap>
            {['pending', 'accepted', 'preparing', 'ready', 'completed', 'rejected', 'cancelled'].map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </Row>
        </Section>

        {/* ── Avatars ──────────────────────────────────── */}
        <Section title="Avatars">
          <Row>
            <Avatar name="Alice Johnson" size="sm" />
            <Avatar name="Bob Martinez" size="md" />
            <Avatar name="Carol White" size="lg" />
            <Avatar name="David Chen" size="md" />
            <Avatar name="Emma Wilson" size="md" />
          </Row>
        </Section>

        {/* ── Cards / Surfaces ─────────────────────────── */}
        <Section title="Cards & Surfaces">
          <Card variant="default" style={{ marginBottom: spacing[3] }}>
            <Text style={ds.cardTitle}>Default Card</Text>
            <Text style={ds.cardBody}>Border + surface background</Text>
          </Card>
          <Card variant="elevated" style={{ marginBottom: spacing[3] }}>
            <Text style={ds.cardTitle}>Elevated Card</Text>
            <Text style={ds.cardBody}>Drop shadow, no border</Text>
          </Card>
          <Card variant="outlined" style={{ marginBottom: spacing[3] }}>
            <Text style={ds.cardTitle}>Outlined Card</Text>
            <Text style={ds.cardBody}>Stronger border color</Text>
          </Card>
        </Section>

        {/* ── Skeletons ────────────────────────────────── */}
        <Section title="Loading States">
          <SkeletonCard />
          <View style={{ marginTop: spacing[3], gap: spacing[2] }}>
            <Skeleton height={20} width="100%" />
            <Skeleton height={20} width="80%" />
            <Skeleton height={20} width="60%" />
          </View>
        </Section>

        {/* ── Empty / Error States ─────────────────────── */}
        <Section title="Empty State">
          <Card>
            <EmptyState icon="📋" title="No orders yet" description="New orders will appear here once customers start ordering." actionLabel="Create Order" onAction={() => {}} />
          </Card>
        </Section>

        <Section title="Error State">
          <Card>
            <ErrorState title="Failed to load" description="Check your connection and try again." onRetry={() => {}} />
          </Card>
        </Section>

        {/* ── Modal ────────────────────────────────────── */}
        <Section title="Modal">
          <Button onPress={() => setModalOpen(true)}>Open Modal</Button>
          <AppModal
            visible={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Example Modal"
            footer={
              <Row>
                <Button variant="secondary" onPress={() => setModalOpen(false)}>Cancel</Button>
                <Button onPress={() => setModalOpen(false)}>Confirm</Button>
              </Row>
            }
          >
            <Text style={{ color: colors.textSecondary, lineHeight: 22 }}>
              This is a modal dialog. It supports a title, scrollable content area,
              and a footer with action buttons.
            </Text>
          </AppModal>
        </Section>

        {/* ── Toast ────────────────────────────────────── */}
        <Section title="Toast Notifications">
          <Row wrap>
            <Button onPress={() => toast.success('Order accepted!')}>Success</Button>
            <Button variant="secondary" onPress={() => toast.error('Payment failed')}>Error</Button>
            <Button variant="secondary" onPress={() => toast.warning('Low stock warning')}>Warning</Button>
            <Button variant="ghost" onPress={() => toast.info('New order received')}>Info</Button>
          </Row>
        </Section>

        {/* ── DataTable ────────────────────────────────── */}
        <Section title="DataTable">
          <DataTable
            columns={[
              { key: 'name', header: 'Item', flex: 2 },
              { key: 'orders', header: 'Orders', align: 'right' },
              { key: 'price', header: 'Price', align: 'right' },
            ]}
            data={DEMO_TABLE_DATA as any}
            keyExtractor={(r: any) => r.id}
          />
        </Section>

      </ScrollView>
    </SafeAreaView>
  )
}

const ds = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgDefault },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing[4], paddingHorizontal: spacing[5], paddingVertical: spacing[4], backgroundColor: colors.bgSurface, borderBottomWidth: 1, borderBottomColor: colors.borderDefault },
  back: { fontSize: fontSizes.md, color: colors.brand, fontWeight: '500' },
  title: { fontSize: fontSizes.xl, fontWeight: fontWeights.bold as any, color: colors.textPrimary },
  scroll: { flex: 1 },
  content: { padding: spacing[5], gap: spacing[1] },
  section: { marginBottom: spacing[8] },
  sectionTitle: { fontSize: fontSizes.lg, fontWeight: fontWeights.bold as any, color: colors.textPrimary, marginBottom: spacing[4], paddingBottom: spacing[2], borderBottomWidth: 2, borderBottomColor: colors.borderDefault },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[3] },
  rowWrap: { flexWrap: 'wrap' },
  label: { fontSize: fontSizes.xs, fontWeight: '700', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing[2], marginTop: spacing[2] },
  colorRow: { marginBottom: spacing[3] },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  swatch: { width: 44, height: 44, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  swatchLabel: { fontSize: 9, color: 'rgba(0,0,0,0.5)', fontWeight: '600' },
  semanticSwatch: { alignItems: 'center', gap: 4, marginRight: spacing[3], marginBottom: spacing[2] },
  semanticColor: { width: 40, height: 40, borderRadius: 8 },
  semanticLabel: { fontSize: 9, color: colors.textSecondary, textAlign: 'center', maxWidth: 56 },
  spacingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  spacingLabel: { fontSize: fontSizes.xs, color: colors.textSecondary, width: 80 },
  radiusSwatch: { alignItems: 'center', gap: spacing[2], marginRight: spacing[4], marginBottom: spacing[3] },
  shadowCard: { flex: 1, backgroundColor: colors.bgSurface, borderRadius: radius.lg, padding: spacing[4], alignItems: 'center', marginRight: spacing[3] },
  cardTitle: { fontSize: fontSizes.md, fontWeight: fontWeights.semibold as any, color: colors.textPrimary, marginBottom: spacing[1] },
  cardBody: { fontSize: fontSizes.sm, color: colors.textSecondary },
})
