import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FieldPolygon, FarmPin, WeatherData } from '../types';
import { SEEDED_FIELDS, SEEDED_PINS } from '../data/seedData';
import { getMockWeather } from '../services/weatherService';

interface FarmState {
  fields: FieldPolygon[];
  selectedFieldId: string;
  pins: FarmPin[];
  selectedDistrict: string;
  currentCenter: [number, number] | null;
  currentZoom: number;
  currentLocationName: string;
  satelliteView: boolean;
  isDrawing: boolean;
  currentDrawingPoints: [number, number][];
  weatherData: WeatherData;
  weatherLoading: boolean;

  setSelectedFieldId: (id: string) => void;
  addField: (field: FieldPolygon) => void;
  updateField: (id: string, updates: Partial<FieldPolygon>) => void;
  deleteField: (id: string) => void;
  addPin: (pin: FarmPin) => void;
  removePin: (id: string) => void;
  setDistrict: (district: string) => void;
  setCurrentCenter: (coords: [number, number], zoom?: number, name?: string) => void;
  toggleSatelliteView: () => void;
  setIsDrawing: (drawing: boolean) => void;
  addDrawingPoint: (point: [number, number]) => void;
  undoLastPoint: () => void;
  clearDrawingPoints: () => void;
  setWeatherData: (weather: WeatherData) => void;
  setWeatherLoading: (loading: boolean) => void;
  resetFarmToDemo: () => void;
}

export const useFarmStore = create<FarmState>()(
  persist(
    (set) => ({
      fields: SEEDED_FIELDS,
      selectedFieldId: SEEDED_FIELDS[0].id,
      pins: SEEDED_PINS,
      selectedDistrict: 'Pune',
      currentCenter: null,
      currentZoom: 13,
      currentLocationName: 'Pune, Maharashtra',
      satelliteView: false,
      isDrawing: false,
      currentDrawingPoints: [],
      weatherData: getMockWeather('Pune'),
      weatherLoading: false,

      setSelectedFieldId: (id: string) => set({ selectedFieldId: id }),

      addField: (field: FieldPolygon) => {
        set((state) => ({
          fields: [...state.fields, field],
          selectedFieldId: field.id,
          currentDrawingPoints: [],
          isDrawing: false,
        }));
      },

      updateField: (id: string, updates: Partial<FieldPolygon>) => {
        set((state) => ({
          fields: state.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
        }));
      },

      deleteField: (id: string) => {
        set((state) => {
          const remaining = state.fields.filter((f) => f.id !== id);
          return {
            fields: remaining,
            selectedFieldId: remaining.length > 0 ? remaining[0].id : '',
          };
        });
      },

      addPin: (pin: FarmPin) => {
        set((state) => ({ pins: [...state.pins, pin] }));
      },

      removePin: (id: string) => {
        set((state) => ({ pins: state.pins.filter((p) => p.id !== id) }));
      },

      setDistrict: (district: string) => {
        set({ selectedDistrict: district });
      },

      setCurrentCenter: (coords: [number, number], zoom?: number, name?: string) => {
        set((state) => ({
          currentCenter: coords,
          currentZoom: zoom !== undefined ? zoom : state.currentZoom,
          currentLocationName: name !== undefined ? name : state.currentLocationName,
        }));
      },

      toggleSatelliteView: () => {
        set((state) => ({ satelliteView: !state.satelliteView }));
      },

      setIsDrawing: (drawing: boolean) => {
        set({ isDrawing: drawing, currentDrawingPoints: drawing ? [] : [] });
      },

      addDrawingPoint: (point: [number, number]) => {
        set((state) => ({
          currentDrawingPoints: [...state.currentDrawingPoints, point],
        }));
      },

      undoLastPoint: () => {
        set((state) => ({
          currentDrawingPoints: state.currentDrawingPoints.slice(0, -1),
        }));
      },

      clearDrawingPoints: () => {
        set({ currentDrawingPoints: [] });
      },

      setWeatherData: (weather: WeatherData) => {
        set({ weatherData: weather, weatherLoading: false });
      },

      setWeatherLoading: (loading: boolean) => {
        set({ weatherLoading: loading });
      },

      resetFarmToDemo: () => {
        set({
          fields: SEEDED_FIELDS,
          selectedFieldId: SEEDED_FIELDS[0].id,
          pins: SEEDED_PINS,
          selectedDistrict: 'Pune',
          satelliteView: false,
          isDrawing: false,
          currentDrawingPoints: [],
          weatherData: getMockWeather('Pune'),
        });
      },
    }),
    {
      name: 'krishicycle_farm_v2',
    }
  )
);
