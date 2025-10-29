import { memo, useMemo } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip, Avatar, Progress } from '@heroui/react'
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Star,
  CheckCircle,
  XCircle,
  UserIcon,
  Eye,
  Heart,
  Users,
  Zap,
  Lock,
  Bell,
  Globe,
  Search,
  Phone,
  AlertTriangle,
  CreditCard,
  Info,
  Database,
  Activity
} from 'lucide-react'
import { USER_INTEREST_COLORS, USER_ROLE_COLORS } from '@constants/tableConstants.js'
import { formatJavaDateForDisplay, daysSinceJavaDate, calculateAgeFromJavaDate } from '@utils/dateUtils.js'

// Helper function to calculate age
const calculateAge = birthDate => {
  if (\!birthDate) return 'N/A'
  try {
    return calculateAgeFromJavaDate(birthDate)
  } catch {
    return 'N/A'
  }
}

const formatLastActive = lastActiveArray => {
  if (\!lastActiveArray || \!Array.isArray(lastActiveArray)) return 'Nunca'
  try {
    return formatJavaDateForDisplay(lastActiveArray)
  } catch {
    return 'Nunca'
  }
}
