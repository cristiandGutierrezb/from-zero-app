import { useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { BiophilicDemo } from '../src/components/estilos/biophilic';
import { ChromeDemo } from '../src/components/estilos/chrome';
import { ClaymorphismDemo } from '../src/components/estilos/claymorphism';
import { LuminousEcoDemo } from '../src/components/estilos/eco';
import { GlassmorphismDemo } from '../src/components/estilos/glassmorphism';
import { HandDrawnDemo } from '../src/components/estilos/hand-drawn';
import { LiquidGlassDemo } from '../src/components/estilos/liquid-glass';
import { ManuscriptDemo } from '../src/components/estilos/manuscript';
import { NeumorphismDemo } from '../src/components/estilos/neumorphism';
import { ScrapbookDemo } from '../src/components/estilos/scrapbook';
import { SkeuomorphismDemo } from '../src/components/estilos/skeuomorphism';
import { SpatialDemo } from '../src/components/estilos/spatial';
import { WoodDemo } from '../src/components/estilos/wood';
import { Y2KDemo } from '../src/components/estilos/y2k';

/**
 * Galería de los estilos visuales vistos en clase. Cada demo vive en
 * src/components/estilos/ y es el mismo código de GUIA-DISENO-UI.md.
 * No necesita sesión ni backend: es solo interfaz.
 */
const ESTILOS = [
  { id: 'skeuo', name: 'Skeuomorfismo', section: '§1', Demo: SkeuomorphismDemo },
  { id: 'neu', name: 'Neumorphism', section: '§2', Demo: NeumorphismDemo },
  { id: 'glass', name: 'Glassmorphism', section: '§3', Demo: GlassmorphismDemo },
  { id: 'liquid', name: 'Liquid Glass', section: '§4', Demo: LiquidGlassDemo },
  { id: 'clay', name: 'Claymorphism', section: '§5', Demo: ClaymorphismDemo },
  { id: 'chrome', name: 'Chrome / Liquid Metal', section: '§6', Demo: ChromeDemo },
  { id: 'y2k', name: 'Y2K Techno', section: '§7.1', Demo: Y2KDemo },
  { id: 'wood', name: 'Madera', section: '§7.2', Demo: WoodDemo },
  { id: 'manuscript', name: 'Manuscrito', section: '§7.3', Demo: ManuscriptDemo },
  { id: 'eco', name: 'Luminous Eco', section: '§7.4', Demo: LuminousEcoDemo },
  { id: 'spatial', name: 'Spatial UI', section: '§8.1', Demo: SpatialDemo },
  { id: 'bio', name: 'Biophilic', section: '§8.2', Demo: BiophilicDemo },
  { id: 'scrap', name: 'Scrapbook / Sticker', section: '§8.3', Demo: ScrapbookDemo },
  { id: 'hand', name: 'Hand-Drawn', section: '§8.4', Demo: HandDrawnDemo },
];

export default function Gallery() {
  const [selected, setSelected] = useState(ESTILOS[0]);
  const { Demo } = selected;

  return (
    <View className="flex-1 bg-neutral-50">
      {/* Selector: lista dinámica horizontal → FlatList (guía §9) */}
      <View className="gap-2 border-b border-neutral-200 bg-white py-3">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={ESTILOS}
          keyExtractor={(e) => e.id}
          contentContainerClassName="gap-2 px-4"
          renderItem={({ item }) => {
            const active = item.id === selected.id;
            return (
              <Pressable
                onPress={() => setSelected(item)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                className={`rounded-full border px-4 py-2 active:opacity-70 ${
                  active ? 'border-blue-600 bg-blue-600' : 'border-neutral-300 bg-white'
                }`}>
                <Text className={`text-xs font-semibold ${active ? 'text-white' : 'text-neutral-600'}`}>
                  {item.name}
                </Text>
              </Pressable>
            );
          }}
        />
        <Text className="px-4 text-xs text-neutral-400">GUIA-DISENO-UI.md {selected.section}</Text>
      </View>

      {/* flex-grow: la demo llena la pantalla y, si es más alta, hace scroll. */}
      <ScrollView key={selected.id} className="flex-1" contentContainerClassName="flex-grow">
        <Demo />
      </ScrollView>
    </View>
  );
}
