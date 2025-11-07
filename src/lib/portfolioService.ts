import { supabase } from './supabase';
import type { DatabasePortfolioItem } from './supabase';
import type { PortfolioItem } from '../types';

// Convertir datos de la UI al formato de base de datos
const toDatabase = (item: Omit<PortfolioItem, 'id' | 'createdAt'>): Omit<DatabasePortfolioItem, 'id' | 'created_at' | 'updated_at'> => ({
  title: item.title,
  artist: item.artist || null,
  description: item.description,
  type: item.type,
  image_url: item.imageUrl,
  audio_url: item.audioUrl || null,
  video_url: item.videoUrl || null,
  genre: item.genre || null,
  duration: item.duration || null
});

// Convertir datos de base de datos al formato de la UI
const fromDatabase = (dbItem: DatabasePortfolioItem): PortfolioItem => ({
  id: dbItem.id,
  title: dbItem.title,
  artist: dbItem.artist || undefined,
  description: dbItem.description,
  type: dbItem.type,
  imageUrl: dbItem.image_url,
  audioUrl: dbItem.audio_url || undefined,
  videoUrl: dbItem.video_url || undefined,
  genre: dbItem.genre || undefined,
  duration: dbItem.duration || undefined,
  createdAt: dbItem.created_at
});

export const portfolioService = {
  // Obtener todos los items del portfolio
  async getAll(): Promise<PortfolioItem[]> {
    console.log('🔄 Cargando portfolio desde Supabase...');
    
    const { data, error } = await supabase
      .from('portfolio')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error obteniendo portfolio:', error);
      throw new Error(`Error al obtener portfolio: ${error.message}`);
    }

    const items = (data || []).map(fromDatabase);
    console.log(`✅ ${items.length} items del portfolio cargados desde Supabase`);
    return items;
  },

  // Crear nuevo item del portfolio
  async create(itemData: Omit<PortfolioItem, 'id' | 'createdAt'>): Promise<PortfolioItem> {
    console.log('🔄 Creando item del portfolio en Supabase...', itemData);
    
    const portfolioData = toDatabase(itemData);

    const { data, error } = await supabase
      .from('portfolio')
      .insert([portfolioData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando item del portfolio:', error);
      throw new Error(`Error al crear item del portfolio: ${error.message}`);
    }

    if (!data) {
      throw new Error('No se recibieron datos del item del portfolio creado');
    }

    const newItem = fromDatabase(data);
    console.log('✅ Item del portfolio creado exitosamente:', newItem.id);
    return newItem;
  },

  // Actualizar item del portfolio
  async update(id: string, updates: Partial<Omit<PortfolioItem, 'id' | 'createdAt'>>): Promise<PortfolioItem> {
    console.log('🔄 Actualizando item del portfolio en Supabase...', { id, updates });
    
    // Convertir solo los campos que se están actualizando
    const updateData: Partial<DatabasePortfolioItem> = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.artist !== undefined) updateData.artist = updates.artist || null;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
    if (updates.audioUrl !== undefined) updateData.audio_url = updates.audioUrl || null;
    if (updates.videoUrl !== undefined) updateData.video_url = updates.videoUrl || null;
    if (updates.genre !== undefined) updateData.genre = updates.genre || null;
    if (updates.duration !== undefined) updateData.duration = updates.duration || null;

    const { data, error } = await supabase
      .from('portfolio')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error actualizando item del portfolio:', error);
      throw new Error(`Error al actualizar item del portfolio: ${error.message}`);
    }

    if (!data) {
      throw new Error('No se recibieron datos del item del portfolio actualizado');
    }

    const updatedItem = fromDatabase(data);
    console.log('✅ Item del portfolio actualizado exitosamente');
    return updatedItem;
  },

  // Eliminar item del portfolio
  async delete(id: string): Promise<void> {
    console.log('🔄 Eliminando item del portfolio de Supabase...', id);

    const { error } = await supabase
      .from('portfolio')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error eliminando item del portfolio:', error);
      throw new Error(`Error al eliminar item del portfolio: ${error.message}`);
    }

    console.log('✅ Item del portfolio eliminado exitosamente');
  }
};