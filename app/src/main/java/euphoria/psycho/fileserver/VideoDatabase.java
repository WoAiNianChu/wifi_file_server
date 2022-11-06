package euphoria.psycho.fileserver;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.database.sqlite.SQLiteQueryBuilder;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class VideoDatabase extends SQLiteOpenHelper {

    private static final int DATABASE_VERSION = 1;

    public VideoDatabase(Context context, String name) {
        super(context, name, null, DATABASE_VERSION);
    }

    public void deleteVideo(int id) {
        getWritableDatabase().delete("video", "_id = ?", new String[]{Integer.toString(id)});
    }

    public long insertVideo(String title, String url, String play, String musicPlay, String musicTitle, String musicAuthor, String cover, int createAt, int updateAt) {
        ContentValues values = new ContentValues();
        values.put("title", title);
        values.put("url", url);
        values.put("play", play);
        values.put("music_play", musicPlay);
        values.put("music_title", musicTitle);
        values.put("music_author", musicAuthor);
        values.put("cover", cover);
        values.put("create_at", createAt);
        values.put("update_at", updateAt);
        return getWritableDatabase().insert("video", null, values);
    }

    public String queryAll() throws JSONException {
        Cursor c = getReadableDatabase().rawQuery("select _id,title,url,play,music_play,music_title,music_author,cover,create_at,update_at from video", null);
        JSONArray jsonArray = new JSONArray();
        while (c.moveToNext()) {
            JSONObject object = new JSONObject();
            object.put("_id", c.getString(0));
            object.put("title", c.getString(1));
            object.put("url", c.getString(2));
            object.put("play", c.getString(3));
            object.put("music_play", c.getString(4));
            object.put("music_title", c.getString(5));
            object.put("music_author", c.getString(6));
            object.put("cover", c.getString(7));
            object.put("create_at", c.getString(8));
            object.put("update_at", c.getString(9));
            jsonArray.put(object);
        }
        c.close();
        return jsonArray.toString();
    }

    public String queryVideo(int id) throws JSONException {
        Cursor c = getReadableDatabase().rawQuery("select title,url,play,music_play,music_title,music_author,cover,create_at,update_at from video where _id = ?", new String[]{
                Integer.toString(id)
        });
        JSONObject object = new JSONObject();
        if (c.moveToNext()) {
            object.put("title", c.getString(0));
            object.put("url", c.getString(1));
            object.put("play", c.getString(2));
            object.put("music_play", c.getString(3));
            object.put("music_title", c.getString(4));
            object.put("music_author", c.getString(5));
            object.put("cover", c.getString(6));
            object.put("create_at", c.getString(7));
            object.put("update_at", c.getString(8));
        }
        c.close();
        return object.toString();
    }

    @Override
    public void onCreate(SQLiteDatabase sqLiteDatabase) {
        sqLiteDatabase.execSQL("create table video(        _id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT,url TEXT,play TEXT,music_play TEXT,music_title TEXT,music_author TEXT,cover TEXT,create_at INTEGER,update_at INTEGER    )");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
    }
}