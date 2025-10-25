// src/types/bottomSheet.ts
export type BottomSheetRefType = {
  expand?: () => void;
  close: () => void;
  snapTOIndex?: () => void;
};


export type BottomSheetScreenProps = {
  bottomSheetRef?: React.RefObject<BottomSheetRefType> | null;
};