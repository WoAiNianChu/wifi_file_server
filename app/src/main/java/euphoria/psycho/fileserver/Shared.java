package euphoria.psycho.fileserver;

import android.annotation.TargetApi;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.os.Build.VERSION;
import android.os.Build.VERSION_CODES;
import android.os.Environment;
import android.os.storage.StorageManager;
import android.provider.DocumentsContract.Document;
import android.provider.Settings;
import android.util.Log;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Array;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;


public class Shared {
    private static final String TAG = "";

    public static Bitmap createVideoThumbnail(String filePath) {
        // MediaMetadataRetriever is available on API Level 8
        // but is hidden until API Level 10
        Class<?> clazz = null;
        Object instance = null;
        try {
            clazz = Class.forName("android.media.MediaMetadataRetriever");
            instance = clazz.newInstance();
            Method method = clazz.getMethod("setDataSource", String.class);
            method.invoke(instance, filePath);
            // The method name changes between API Level 9 and 10.
            if (Build.VERSION.SDK_INT <= 9) {
                return (Bitmap) clazz.getMethod("captureFrame").invoke(instance);
            } else {
                byte[] data = (byte[]) clazz.getMethod("getEmbeddedPicture").invoke(instance);
                if (data != null) {
                    Bitmap bitmap = BitmapFactory.decodeByteArray(data, 0, data.length);
                    if (bitmap != null) return bitmap;
                }
                return (Bitmap) clazz.getMethod("getFrameAtTime").invoke(instance);
            }
        } catch (IllegalArgumentException ex) {
            // Assume this is a corrupt video file
        } catch (RuntimeException ex) {
            // Assume this is a corrupt video file.
        } catch (InstantiationException e) {
            Log.e(TAG, "createVideoThumbnail", e);
        } catch (InvocationTargetException e) {
            Log.e(TAG, "createVideoThumbnail", e);
        } catch (ClassNotFoundException e) {
            Log.e(TAG, "createVideoThumbnail", e);
        } catch (NoSuchMethodException e) {
            Log.e(TAG, "createVideoThumbnail", e);
        } catch (IllegalAccessException e) {
            Log.e(TAG, "createVideoThumbnail", e);
        } finally {
            try {
                if (instance != null) {
                    clazz.getMethod("release").invoke(instance);
                }
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    public static String getDeviceIP(Context context) {
        WifiManager wifiManager = (WifiManager) context.getApplicationContext().getSystemService(Context.WIFI_SERVICE);
        try {
            WifiInfo wifiInfo = wifiManager.getConnectionInfo();
            int rawIp = wifiInfo.getIpAddress();
            if (rawIp == 0) {
                Method method = wifiManager.getClass().getDeclaredMethod("isWifiApEnabled");
                method.setAccessible(true);
                boolean isWifiApEnabled = (boolean) method.invoke(wifiManager);
                if (isWifiApEnabled)
                    return getWifiApIpAddress();
                else
                    return null;
            }
            //Log.e("B5aOx2", String.format("getDeviceIP, %s", wifiManager.getConnectionInfo().getSupplicantState().name()));
            InetAddress inetAddress = intToInetAddress(rawIp);
            return inetAddress.getHostAddress();
        } catch (Exception e) {
            Log.e("TAG", e.getMessage());
            return null;
        }
    }

    public static String getExternalStoragePath(Context context) {
        StorageManager mStorageManager = (StorageManager) context.getSystemService(Context.STORAGE_SERVICE);
        Class<?> storageVolumeClazz = null;
        try {
            storageVolumeClazz = Class.forName("android.os.storage.StorageVolume");
            Method getVolumeList = mStorageManager.getClass().getMethod("getVolumeList");
            Method getPath = storageVolumeClazz.getMethod("getPath");
            Method isRemovable = storageVolumeClazz.getMethod("isRemovable");
            Object result = getVolumeList.invoke(mStorageManager);
            if (result == null) return null;
            final int length = Array.getLength(result);
            for (int i = 0; i < length; i++) {
                Object storageVolumeElement = Array.get(result, i);
                String path = (String) getPath.invoke(storageVolumeElement);
                Object removableObject = isRemovable.invoke(storageVolumeElement);
                if (removableObject == null) return null;
                boolean removable = (Boolean) removableObject;
                if (removable) {
                    return path;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public static String getWifiApIpAddress() {
        try {
            for (Enumeration<NetworkInterface> en = NetworkInterface.getNetworkInterfaces(); en
                    .hasMoreElements(); ) {
                NetworkInterface intf = en.nextElement();
                if (intf.getName().contains("wlan")) {
                    for (Enumeration<InetAddress> enumIpAddr = intf.getInetAddresses(); enumIpAddr
                            .hasMoreElements(); ) {
                        InetAddress inetAddress = enumIpAddr.nextElement();
                        if (!inetAddress.isLoopbackAddress()
                                && (inetAddress.getAddress().length == 4)) {
                            return inetAddress.getHostAddress();
                        }
                    }
                }
            }
        } catch (SocketException ex) {
        }
        return null;
    }

    public static InetAddress intToInetAddress(int hostAddress) {
        byte[] addressBytes = {(byte) (0xff & hostAddress),
                (byte) (0xff & (hostAddress >> 8)),
                (byte) (0xff & (hostAddress >> 16)),
                (byte) (0xff & (hostAddress >> 24))};
        try {
            return InetAddress.getByAddress(addressBytes);
        } catch (UnknownHostException e) {
            throw new AssertionError();
        }
    }

    public static List<FileInfo> listAndroidData(Context context, String treeUri, String path) {
        Cursor c = context.getContentResolver().query(
                Uri.parse(treeUri + "/document/primary%3AAndroid%2Fdata" + path + "/children"), new String[]{
                        Document.COLUMN_DISPLAY_NAME, Document.COLUMN_MIME_TYPE,
                        Document.COLUMN_LAST_MODIFIED,
                        Document.COLUMN_SIZE}, null, null, null
        );
        List<FileInfo> files = new ArrayList<>();
        while (c.moveToNext()) {
            FileInfo fileInfo = new FileInfo();
            fileInfo.Name = c.getString(0);
            fileInfo.IsDir = c.getString(1).equals(Document.MIME_TYPE_DIR);
            fileInfo.LastModified = c.getLong(2);
            fileInfo.Length = c.getLong(3);
            files.add(fileInfo);
//            try {
//                DocumentsContract.createDocument(
//                        context.getContentResolver(),
//                        Uri.parse(treeUri + "/document/primary%3AAndroid%2Fdata%2Feuphoria.psycho.porn%2Ffiles"),
//                        Document.MIME_TYPE_DIR,
//                        "good"
//                );
//            } catch (Exception e) {
//                Log.e("B5aOx2", String.format("listAndroidData, %s", e.getMessage()));
//            }
        }
        c.close();
        return files;
    }

    public static String md5(String md5) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] array = md.digest(md5.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : array) {
                sb.append(Integer.toHexString((b & 0xFF) | 0x100).substring(1, 3));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException ignored) {
        }
        return null;
    }

    public static String readAllText(InputStream in) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(in));
        String line;
        StringBuilder stringBuilder = new StringBuilder();
        while ((line = reader.readLine()) != null) {
            stringBuilder.append(line).append('\n');
        }
        return stringBuilder.toString();
    }

    public static void recursiveDelete(File rootDir) {
        if (rootDir.isDirectory()) {
            File[] childFiles = rootDir.listFiles();
            if (childFiles != null) {
                for (File child : childFiles) {
                    recursiveDelete(child);
                }
            }
        }
        rootDir.delete();
    }

    @TargetApi(VERSION_CODES.Q)
    public static void requestDocumentPermission(Activity activity, String folder, int requestCode) {
        StorageManager storageManager = (StorageManager) activity.getSystemService(Context.STORAGE_SERVICE);
        Intent intent = storageManager.getPrimaryStorageVolume().createOpenDocumentTreeIntent();
        String targetDirectory = "Android%2F" + folder;
        Uri uri = intent.getParcelableExtra("android.provider.extra.INITIAL_URI");
        String scheme = uri.toString();
        // content://com.android.externalstorage.documents/root/primary
        scheme = scheme.replace("/root/", "/document/");
        scheme += "%3A" + targetDirectory;
        uri = Uri.parse(scheme);
        intent.putExtra("android.provider.extra.INITIAL_URI", uri);
        // content://com.android.externalstorage.documents/document/primary%3AAndroid%2Fdata
        activity.startActivityForResult(intent, requestCode);
    }

    public static void requestManageAllFilesPermission(Activity activity) {
        if (VERSION.SDK_INT >= VERSION_CODES.R) {
            if (!Environment.isExternalStorageManager()) {
                try {
                    Uri uri = Uri.parse("package:" + activity.getApplicationContext().getPackageName());
                    Intent intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION, uri);
                    activity.startActivity(intent);
                } catch (Exception ex) {
                    Intent intent = new Intent();
                    intent.setAction(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION);
                    activity.startActivity(intent);
                }
            }
        }
    }

    public static String substringAfterLast(String s, String delimiter) {
        int index = s.lastIndexOf(delimiter);
        if (index == -1) return s;
        return s.substring(index + delimiter.length());
    }

    public static String substringBeforeLast(String s, String delimiter) {
        int index = s.lastIndexOf(delimiter);
        if (index == -1) return s;
        return s.substring(0, index);
    }

    public static class FileInfo {
        public String Name;
        public boolean IsDir;
        public long LastModified;
        public long Length;
    }
}
// https://android.googlesource.com/platform/tools/tradefederation/+/dfd83b4c73cdb2ac0c2459f90b6caed8642cf684/src/com/android/tradefed/util/FileUtil.java
