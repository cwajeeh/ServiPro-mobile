import { Platform } from 'react-native';

import { apiClient } from '@/api/client';

export interface UploadOptions {
  rootFolder: string;
  subFolder?: string;
}

export interface UploadedFileResult {
  url: string;
  fileName?: string;
  mimeType?: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function extractUploadedFiles(data: unknown): unknown[] {
  if (!isRecord(data)) {
    return [];
  }
  const inner = data.data;
  if (!isRecord(inner)) {
    return [];
  }
  const files = inner.file;
  return Array.isArray(files) ? files : [];
}

export async function uploadFiles(
  files: { uri: string; mimeType?: string; fileName?: string }[],
  options: UploadOptions,
): Promise<UploadedFileResult[]> {
  const form = new FormData();
  form.append('rootFolder', options.rootFolder);
  if (options.subFolder) {
    form.append('subFolder', options.subFolder);
  }

  for (const file of files) {
    const uri = Platform.OS === 'android' ? file.uri : file.uri.replace('file://', '');
    const name = file.fileName || (file.uri ? file.uri.split('/').pop() : 'upload.jpg') || 'upload.jpg';
    const type = file.mimeType || 'image/jpeg';

    // React Native file entry for FormData (not covered by DOM typings)
    form.append('files', { uri, name, type } as never);
  }

  form.append('rootFolder', options.rootFolder);
  if (options.subFolder) {
    form.append('subFolder', options.subFolder);
  }

  const { data } = await apiClient.post<unknown>('/user/uploads', form, {
    transformRequest: (body, headers) => {
      if (typeof FormData !== 'undefined' && body instanceof FormData) {
        delete headers['Content-Type'];
      }
      return body;
    },
  });

  if (!isRecord(data)) {
    throw new Error('Upload failed');
  }
  const sc = data.statusCode;
  if (typeof sc === 'number' && sc !== 200 && sc !== 201) {
    const msg = typeof data.message === 'string' ? data.message : 'Upload failed';
    throw new Error(msg);
  }

  const rawList = extractUploadedFiles(data);

  if (rawList.length === 0 && files.length > 0) {
    throw new Error('Upload failed: server did not return any file URLs.');
  }

  return rawList.map((item): UploadedFileResult => {
    if (!isRecord(item)) {
      return { url: String(item) };
    }
    return {
      url:
        typeof item.url === 'string'
          ? item.url
          : typeof item.file_url === 'string'
            ? item.file_url
            : typeof item.imageUrl === 'string'
              ? item.imageUrl
              : typeof item.image_url === 'string'
                ? item.image_url
                : String(item),
      fileName:
        typeof item.fileName === 'string'
          ? item.fileName
          : typeof item.file_name === 'string'
            ? item.file_name
            : undefined,
      mimeType:
        typeof item.mimeType === 'string'
          ? item.mimeType
          : typeof item.mime_type === 'string'
            ? item.mime_type
            : undefined,
    };
  });
}
