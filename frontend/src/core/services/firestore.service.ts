import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase.config';

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  categoriaId: string;
  categoriaNombre: string;
  activo: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
}

const COLLECTIONS = {
  productos: 'productos',
  categorias: 'categorias',
  usuarios: 'usuarios',
};

export const firestoreService = {
  async getAll<T>(collectionName: string): Promise<T[]> {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  },

  async getById<T>(collectionName: string, id: string): Promise<T | null> {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  },

  async create<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  },

  async update<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, data);
  },

  async remove(collectionName: string, id: string): Promise<void> {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  },

  async query<T>(
    collectionName: string,
    field: string,
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=',
    value: unknown
  ): Promise<T[]> {
    const q = query(collection(db, collectionName), where(field, operator, value));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  },

  async queryOrdered<T>(
    collectionName: string,
    field: string,
    direction: 'asc' | 'desc' = 'asc'
  ): Promise<T[]> {
    const q = query(collection(db, collectionName), orderBy(field, direction));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  },

  COLLECTIONS,
};
