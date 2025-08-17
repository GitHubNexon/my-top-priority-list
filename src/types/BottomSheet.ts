// src/types/bottomSheet.ts
export type BottomSheetRefType = {
  close: () => void;
  show?: () => void;
} | null;


export type BottomSheetScreenProps = {
  bottomSheetRef?: React.RefObject<BottomSheetRefType> | null;
};