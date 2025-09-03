/**
 * Children React Query Hooks
 * Server state management for children with optimistic updates
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys, mutationKeys } from '../../../infrastructure/api/queryClient';
import { apiClient } from '../../../infrastructure/api/ApiClient';
import { useChildrenStore } from '../../../presentation/store/childrenStore';
import { ChildEntity } from '../../../core/entities/Child';
import Toast from 'react-native-toast-message';

// Get all children query
export function useChildren() {
  const { setChildren } = useChildrenStore();
  
  return useQuery({
    queryKey: queryKeys.children.lists(),
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/children');
      const children = response.data.map(c => ChildEntity.fromJSON(c));
      
      // Sync with Zustand store
      setChildren(children);
      
      return children;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get single child query
export function useChild(id: number) {
  return useQuery({
    queryKey: queryKeys.children.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<any>(`/children/${id}`);
      return ChildEntity.fromJSON(response.data);
    },
    enabled: !!id,
  });
}

// Create child mutation with optimistic update
export function useCreateChild() {
  const queryClient = useQueryClient();
  const { addChild } = useChildrenStore();
  
  return useMutation({
    mutationKey: mutationKeys.children.create,
    mutationFn: async (data: {
      firstName: string;
      lastName: string;
      birthDate: Date;
      avatar?: string;
    }) => {
      const response = await apiClient.post<any>('/children', data);
      return ChildEntity.fromJSON(response.data);
    },
    onMutate: async (newChild) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.children.lists() });
      
      // Snapshot previous value
      const previousChildren = queryClient.getQueryData<ChildEntity[]>(
        queryKeys.children.lists()
      );
      
      // Optimistically update
      const tempChild = ChildEntity.fromJSON({
        ...newChild,
        id: Date.now(), // Temporary ID
        points: 0,
        level: 1,
        parentId: 0,
        isActive: true,
      });
      
      if (previousChildren) {
        queryClient.setQueryData<ChildEntity[]>(
          queryKeys.children.lists(),
          [...previousChildren, tempChild]
        );
      }
      
      return { previousChildren, tempChild };
    },
    onSuccess: (child, _, context) => {
      // Replace temp child with real one
      const children = queryClient.getQueryData<ChildEntity[]>(
        queryKeys.children.lists()
      );
      
      if (children && context?.tempChild) {
        const updated = children.map(c => 
          c.id === context.tempChild.id ? child : c
        );
        queryClient.setQueryData(queryKeys.children.lists(), updated);
      }
      
      // Update Zustand
      addChild(child);
      
      Toast.show({
        type: 'success',
        text1: 'Enfant ajouté',
        text2: `${child.firstName} a été ajouté avec succès`,
      });
    },
    onError: (_, __, context) => {
      // Revert optimistic update on error
      if (context?.previousChildren) {
        queryClient.setQueryData(queryKeys.children.lists(), context.previousChildren);
      }
      
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible d\'ajouter l\'enfant',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.children.lists() });
    },
  });
}

// Add points mutation with optimistic update
export function useAddPoints() {
  const queryClient = useQueryClient();
  const { addPoints } = useChildrenStore();
  
  return useMutation({
    mutationKey: mutationKeys.children.addPoints,
    mutationFn: async ({ childId, points }: { childId: number; points: number }) => {
      const response = await apiClient.post<any>(`/children/${childId}/add-points`, {
        points,
      });
      return ChildEntity.fromJSON(response.data);
    },
    onMutate: async ({ childId, points }) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: queryKeys.children.detail(childId) });
      
      // Optimistic update in Zustand
      addPoints(childId, points);
      
      // Get previous value
      const previousChild = queryClient.getQueryData<ChildEntity>(
        queryKeys.children.detail(childId)
      );
      
      // Optimistically update cache
      if (previousChild) {
        const updated = { ...previousChild };
        updated.points += points;
        updated.level = Math.floor(updated.points / 100) + 1;
        queryClient.setQueryData(queryKeys.children.detail(childId), updated);
      }
      
      return { previousChild };
    },
    onSuccess: (updatedChild, { childId }) => {
      // Update cache with server response
      queryClient.setQueryData(queryKeys.children.detail(childId), updatedChild);
      
      // Check if leveled up
      const oldLevel = Math.floor((updatedChild.points - 100) / 100) + 1;
      if (updatedChild.level > oldLevel) {
        Toast.show({
          type: 'success',
          text1: 'Niveau supérieur !',
          text2: `${updatedChild.firstName} est maintenant niveau ${updatedChild.level} !`,
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Points ajoutés',
          text2: `+${updatedChild.points} points`,
        });
      }
    },
    onError: (_, { childId }, context) => {
      // Revert optimistic update
      if (context?.previousChild) {
        queryClient.setQueryData(
          queryKeys.children.detail(childId),
          context.previousChild
        );
      }
      
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible d\'ajouter les points',
      });
    },
    onSettled: (_, __, { childId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.children.detail(childId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.children.lists() });
    },
  });
}

// Child statistics query
export function useChildStats(childId: number) {
  return useQuery({
    queryKey: queryKeys.children.stats(childId),
    queryFn: async () => {
      const response = await apiClient.get<{
        totalPoints: number;
        totalMissions: number;
        completedMissions: number;
        totalRewards: number;
        claimedRewards: number;
        currentLevel: number;
      }>(`/children/${childId}/stats`);
      return response.data;
    },
    enabled: !!childId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}