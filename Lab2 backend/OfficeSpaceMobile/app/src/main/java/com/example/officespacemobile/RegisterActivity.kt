package com.example.officespacemobile

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

class RegisterActivity : AppCompatActivity() {

    private lateinit var etNewUsername: EditText
    private lateinit var etNewEmail: EditText
    private lateinit var etNewPassword: EditText
    private lateinit var btnRegister: Button

    private val client = OkHttpClient()
    private val API_URL = "http://10.0.2.2:3000/api/users"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        etNewUsername = findViewById(R.id.etNewUsername)
        etNewEmail = findViewById(R.id.etNewEmail)
        etNewPassword = findViewById(R.id.etNewPassword)
        btnRegister = findViewById(R.id.btnRegister)

        btnRegister.setOnClickListener {
            val username = etNewUsername.text.toString().trim()
            val email = etNewEmail.text.toString().trim()
            val password = etNewPassword.text.toString().trim()

            if (username.isEmpty() || email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Всі поля обов’язкові", Toast.LENGTH_SHORT).show()
            } else if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                Toast.makeText(this, "Невалідна електронна пошта", Toast.LENGTH_SHORT).show()
            } else {
                checkDuplicateEmail(username, email, password)
            }
        }
    }

    private fun checkDuplicateEmail(username: String, email: String, password: String) {
        val request = Request.Builder()
            .url(API_URL)
            .get()
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@RegisterActivity, "Помилка перевірки", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                val userList = response.body?.string()?.let { JSONArray(it) }
                val exists = userList?.let {
                    (0 until it.length()).any { i ->
                        val u = it.getJSONObject(i)
                        u.getString("email") == email || u.getString("username") == username
                    }
                } ?: false

                runOnUiThread {
                    if (exists) {
                        Toast.makeText(this@RegisterActivity, "Користувач або email вже існує", Toast.LENGTH_SHORT).show()
                    } else {
                        registerOnServer(username, email, password)
                    }
                }
            }
        })
    }


    private fun registerOnServer(username: String, email: String, password: String) {
        val json = JSONObject()
        json.put("username", username)
        json.put("email", email)
        json.put("password", password)
        json.put("role", "user")

        val requestBody = RequestBody.create(
            "application/json; charset=utf-8".toMediaTypeOrNull(),
            json.toString()
        )

        val request = Request.Builder()
            .url(API_URL)
            .post(requestBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                runOnUiThread {
                    Toast.makeText(this@RegisterActivity, "Помилка сервера", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onResponse(call: Call, response: Response) {
                if (response.isSuccessful) {
                    // можливо сервер повертає created user
                    val responseBody = response.body?.string()
                    val userJson = responseBody?.let { JSONObject(it) }?.optJSONObject("user")

                    val prefs = getSharedPreferences("user_prefs", Context.MODE_PRIVATE)
                    if (userJson != null) {
                        val id = userJson.getInt("id")
                        val uname = userJson.getString("username")
                        val mail = userJson.getString("email")
                        prefs.edit()
                            .putInt("user_id", id)
                            .putString("user_name", uname)
                            .putString("user_email", mail)
                            .apply()
                    }

                    runOnUiThread {
                        Toast.makeText(this@RegisterActivity, "Реєстрація успішна", Toast.LENGTH_SHORT).show()
                        startActivity(Intent(this@RegisterActivity, HomeActivity::class.java))
                        finish()
                    }
                } else {
                    runOnUiThread {
                        Toast.makeText(this@RegisterActivity, "Користувача не створено", Toast.LENGTH_SHORT).show()
                    }
                }
            }

        })
    }
}
