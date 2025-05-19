package com.example.officespacemobile

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import org.json.JSONObject
import java.io.IOException

class MainActivity : AppCompatActivity() {

    private lateinit var etUsername: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnLogin: Button
    private lateinit var btnGoToRegister: Button

    private val client = OkHttpClient()
    private val loginUrl = "http://10.0.2.2:3000/api/auth/login"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        etUsername = findViewById(R.id.etUsername)
        etPassword = findViewById(R.id.etPassword)
        btnLogin = findViewById(R.id.btnLogin)
        btnGoToRegister = findViewById(R.id.btnGoToRegister)

        btnLogin.setOnClickListener {
            val username = etUsername.text.toString().trim()
            val password = etPassword.text.toString().trim()

            if (username.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Заповніть усі поля", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val json = JSONObject()
            json.put("username", username)
            json.put("password", password)

            val body = RequestBody.create("application/json".toMediaTypeOrNull(), json.toString())

            val request = Request.Builder()
                .url(loginUrl)
                .post(body)
                .build()

            client.newCall(request).enqueue(object : Callback {
                override fun onFailure(call: Call, e: IOException) {
                    runOnUiThread {
                        Toast.makeText(this@MainActivity, "Помилка сервера", Toast.LENGTH_SHORT).show()
                        Log.e("LOGIN_ERROR", "Server error: ${e.message}")
                    }
                }

                override fun onResponse(call: Call, response: Response) {
                    val responseBody = response.body?.string()
                    if (!response.isSuccessful || responseBody == null) {
                        runOnUiThread {
                            Toast.makeText(this@MainActivity, "Невірний логін або пароль", Toast.LENGTH_SHORT).show()
                        }
                        return
                    }

                    val jsonUser = JSONObject(responseBody).getJSONObject("user")
                    val userId = jsonUser.getInt("id")
                    val username = jsonUser.getString("username")
                    val email = jsonUser.getString("email")

                    val prefs = getSharedPreferences("user_prefs", Context.MODE_PRIVATE)
                    prefs.edit()
                        .putInt("user_id", userId)
                        .putString("user_name", username)
                        .putString("user_email", email)
                        .apply()

                    runOnUiThread {
                        Toast.makeText(this@MainActivity, "Вхід успішний", Toast.LENGTH_SHORT).show()
                        startActivity(Intent(this@MainActivity, HomeActivity::class.java))
                        finish()
                    }
                }
            })
        }

        btnGoToRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }
}
