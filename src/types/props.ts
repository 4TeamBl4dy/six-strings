import { Guitar } from './product'; // For ModalWindowProps
import { UserProfile } from './user'; // For SidebarFooterProfileProps (changed from SalerPublicProfile)
// SalerPublicProfile might still be needed if specific saler features are used by the component later
// For now, UserProfile is more generic for a shared footer profile display.
// import { SalerPublicProfile } from './saler'; 

// Props for ModalWindow component
export interface ModalWindowProps {
  guitar: Guitar; // Uses the global Guitar type
}

// Props for PaymentModal component
export interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: () => void;
}

// Props for SidebarFooterProfile component
// Used by both general Dashboard and SalerDashboard footers
export interface SidebarFooterProfileProps {
  user: UserProfile | null; // Changed to UserProfile for broader usability
  onLogout: () => void;
  refreshUser: () => void;
}
