"use client";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/firebaseClient";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Signup() {
  const router = useRouter();
  const [phoneNum, setPhoneNum] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handlePress = (e) => {
    const regex = /^[0-9\b -]{0,13}$/;
    if (regex.test(e.target.value)) {
      setPhoneNum(e.target.value);
    }
  };
  useEffect(() => {
    if (phoneNum.length === 10) {
      setPhoneNum(phoneNum.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3"));
    }
    if (phoneNum.length === 13) {
      setPhoneNum(
        phoneNum.replace(/-/g, "").replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")
      );
    }
  }, [phoneNum]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-100">
      <div className="bg-white p-layout rounded-layout shadow-md w-full max-w-md">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const inputs = e.target;
            const phone_regex = new RegExp(
              "01(?:0|1|[6-9])[.-]?(\\d{3}|\\d{4})[.-]?(\\d{4})"
            );

            if (inputs.name.value == null || inputs.name.value == "") {
              alert("Enter Your Name Please");
              return;
            } else if (inputs.email.value == null || inputs.email.value == "") {
              alert("Enter Your E-mail Please");
              return;
            } else if (phoneNum == null || phoneNum == "") {
              alert("Enter Your Phone Number Please");
              return;
            } else if (!phone_regex.test(phoneNum)) {
              alert("Enter a Valid Phone Number Please");
              return;
            } else if (inputs.pass.value == null || inputs.pass.value == "") {
              alert("Enter Your Password Please");
              return;
            } else if (inputs.pass.value.length < 6) {
              alert("Enter Your Password More Than 6 Letters Please");
              return;
            } else if (inputs.pass.value != inputs.passCheck.value) {
              alert("Your Passwords Are Not Same. Please Try Again");
              return;
            } else {
              if (!submitted) {
                const userData = {
                  name: inputs.name.value,
                  email: inputs.email.value,
                  phone: phoneNum,
                };
                setSubmitted(true);
                createUserWithEmailAndPassword(
                  auth,
                  inputs.email.value,
                  inputs.pass.value
                )
                  .then(async (userCredential) => {
                    const ref = doc(
                      db,
                      "users",
                      userCredential.user.uid.toString()
                    );
                    await setDoc(ref, userData);
                    router.push("/login");
                  })
                  .catch((e) => {
                    alert(e.message);
                    setSubmitted(false);
                  });
              }
            }
          }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-secondary-700">LOGO</h2>
          </div>
          <div className="space-y-4">
            <div>
              <input
                placeholder="이름"
                id="name"
                type="text"
                className="w-full p-3 border border-secondary-300 rounded-layout focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <input
                placeholder="이메일"
                id="email"
                type="text"
                className="w-full p-3 border border-secondary-300 rounded-layout focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <input
                placeholder="휴대폰 번호"
                onChange={handlePress}
                value={phoneNum}
                type="text"
                className="w-full p-3 border border-secondary-300 rounded-layout focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <input
                placeholder="비밀번호"
                id="pass"
                type="password"
                className="w-full p-3 border border-secondary-300 rounded-layout focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <input
                placeholder="비밀번호 확인"
                id="passCheck"
                type="password"
                className="w-full p-3 border border-secondary-300 rounded-layout focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-primary-500 text-white font-bold py-3 px-4 rounded-layout hover:bg-primary-700 transition duration-300"
            >
              회원 가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
