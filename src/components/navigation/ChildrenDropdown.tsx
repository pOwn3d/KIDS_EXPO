import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks/useSimpleTheme';
import { childrenService, type Child } from '../../services/children.service';


interface ChildrenDropdownProps {
  selectedChild?: Child | null;
  onChildSelect?: (child: Child) => void;
}

const ChildrenDropdown: React.FC<ChildrenDropdownProps> = ({ 
  selectedChild, 
  onChildSelect 
}) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setIsLoading(true);
      const childrenData = await childrenService.getAllChildren();
      setChildren(childrenData || []);
    } catch (error) {
      console.error('Failed to load children:', error);
      setChildren([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChildSelect = (child: Child) => {
    setIsOpen(false);
    if (onChildSelect) {
      onChildSelect(child);
    } else {
      // Navigation par défaut vers la page enfant
      // Navigate to the Children stack and then to ChildProfile
      (navigation as any).navigate('Main', {
        screen: 'Children',
        params: {
          screen: 'ChildProfile',
          params: { childId: child.id }
        }
      });
    }
  };

  const getChildAvatar = (avatar?: string) => {
    if (avatar && avatar !== 'default.png' && !avatar.startsWith('👤')) {
      return avatar;
    }
    return '👦'; // Avatar par défaut
  };

  const getDisplayName = (child: Child) => {
    return child.firstName || child.name || `Enfant ${child.id}`;
  };

  if (isLoading || children.length === 0) {
    return (
      <TouchableOpacity 
        style={[styles.dropdownButton, { backgroundColor: theme.colors.surface }]}
        disabled={true}
      >
        <View style={styles.selectedChild}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.colors.background }]}>
            <Text style={styles.avatarText}>👦</Text>
          </View>
          <View style={styles.childInfo}>
            <Text style={[styles.childName, { color: theme.colors.textSecondary }]}>
              {isLoading ? 'Chargement...' : 'Aucun enfant'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const currentChild = selectedChild || children[0];

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.dropdownButton, { backgroundColor: theme.colors.surface }]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
      >
        <View style={styles.selectedChild}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.colors.background }]}>
            <Text style={styles.avatarText}>
              {getChildAvatar(currentChild?.avatar)}
            </Text>
          </View>
          <View style={styles.childInfo}>
            <Text style={[styles.childName, { color: theme.colors.text }]}>
              {getDisplayName(currentChild)}
            </Text>
            <Text style={[styles.childPoints, { color: theme.colors.textSecondary }]}>
              {currentChild?.currentPoints || 0} pts
            </Text>
          </View>
        </View>
        <Ionicons 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={theme.colors.textSecondary} 
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={[styles.dropdownModal, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Sélectionner un enfant
              </Text>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.childrenList} showsVerticalScrollIndicator={false}>
              {children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={[
                    styles.childOption,
                    { 
                      backgroundColor: currentChild?.id === child.id 
                        ? `${theme.colors.primary}15` 
                        : 'transparent'
                    }
                  ]}
                  onPress={() => handleChildSelect(child)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.avatarContainer, { backgroundColor: theme.colors.background }]}>
                    <Text style={styles.avatarText}>
                      {getChildAvatar(child.avatar)}
                    </Text>
                  </View>
                  <View style={styles.childDetails}>
                    <Text style={[styles.childName, { color: theme.colors.text }]}>
                      {getDisplayName(child)}
                    </Text>
                    <View style={styles.childStats}>
                      <Text style={[styles.childPoints, { color: theme.colors.textSecondary }]}>
                        {child.currentPoints || 0} points
                      </Text>
                      <View style={styles.levelBadge}>
                        <Text style={[styles.levelText, { color: theme.colors.primary }]}>
                          Niveau {child.level || 1}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {currentChild?.id === child.id && (
                    <Ionicons 
                      name="checkmark-circle" 
                      size={24} 
                      color={theme.colors.primary} 
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.footerButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                  setIsOpen(false);
                  navigation.navigate('AddChild' as never);
                }}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.footerButtonText}>Ajouter un enfant</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  selectedChild: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  childPoints: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    width: Math.min(width - 40, 400),
    maxHeight: height * 0.7,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  childrenList: {
    maxHeight: height * 0.4,
  },
  childOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  childDetails: {
    flex: 1,
    marginLeft: 4,
  },
  childStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  levelBadge: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  footerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChildrenDropdown;