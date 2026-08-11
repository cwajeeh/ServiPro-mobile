import { launchImageLibrary, type Asset, type ImageLibraryOptions } from 'react-native-image-picker';

export type PickedImage = {
  uri: string;
  fileName: string | null;
  fileSize: number | null;
  mimeType?: string | null;
};

export async function pickImageFromLibrary(options?: {
  quality?: number;
}): Promise<PickedImage | null> {
  const list = await pickImagesFromLibrary({ quality: options?.quality ?? 0.95, selectionLimit: 1 });
  return list[0] ?? null;
}

export async function pickImagesFromLibrary(options: {
  quality?: number;
  selectionLimit: number;
}): Promise<PickedImage[]> {
  const opts = {
    mediaType: 'photo' as const,
    selectionLimit: options.selectionLimit,
    ...(options.quality !== undefined ? { quality: options.quality } : {}),
  } as ImageLibraryOptions;

  const result = await launchImageLibrary(opts);
  if (result.didCancel || !result.assets?.length) {
    return [];
  }
  const out: PickedImage[] = [];
  for (const asset of result.assets as Asset[]) {
    const uri = asset.uri;
    if (!uri) continue;
    const fallbackName = uri.split('/').pop() ?? 'Photo';
    out.push({
      uri,
      fileName: asset.fileName ?? fallbackName,
      fileSize: asset.fileSize ?? null,
      mimeType: (asset as { type?: string }).type ?? 'image/jpeg',
    });
  }
  return out;
}
