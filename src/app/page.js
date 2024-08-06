import { verifyIdToken } from "@/firebase/firebaseAdmin";
import { db } from "@/firebase/firebaseClient";
import { collection, getDocs, query, where } from "firebase/firestore";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function Home() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token");
    if (!token) {
      redirect("/login");
    }
    const decodedToken = await verifyIdToken(token.value);
    const { uid, email } = decodedToken;
    const joinedGroupsData = await getDocs(
      query(
        collection(db, "groups"),
        where("members", "array-contains-any", [uid])
      )
    );
    const joinedGroups = joinedGroupsData.docs.map((e) => {
      const data = e.data();
      return { id: e.id, ...data };
    });

    const getColorByProgress = (progress) => {
      if (progress < 25) return "bg-purple-200";
      if (progress < 50) return "bg-purple-300";
      if (progress < 75) return "bg-purple-400";
      return "bg-purple-500";
    };

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-secondary-700 mb-6 text-center">
          나의 그룹
        </h1>
        <div className="space-y-6">
          {joinedGroups.length > 0 ? (
            joinedGroups.map(async (e, i) => {
              const starttime = new Date(e.timestamp);
              const declarationData = await getDocs(
                collection(db, "declarations", e.id, uid)
              );
              const declarations = declarationData.docs.map((el) => {
                const data = el.data();
                return { id: el.id, ...data };
              });
              const done = declarations.filter((e) => e.fulfilled);

              // // 기간 진행률 계산
              // const today = new Date();
              // const totalDays = e.duration * 7; // 주를 일로 변환
              // const daysPassed = Math.floor(
              //   (today - starttime) / (1000 * 60 * 60 * 24)
              // );
              // const durationProgress = Math.min(
              //   100,
              //   (daysPassed / totalDays) * 100
              // );

              // // 목표 달성 진행률 계산
              // const achievementProgress = Math.min(
              //   100,
              //   (done.length / e.minFulfill) * 100
              // );
              const durationProgress = 50;
              const achievementProgress = 30;

              return (
                <Link
                  key={i}
                  href={`/group/${e.id}`}
                  className="block bg-white shadow-md rounded-layout p-8 hover: shadow-lg transition duration-300"
                >
                  <h2 className="text-2xl font-semibold text-secondary-700 mb-2">
                    {e.name}
                  </h2>
                  <div className="space-y-3 text-secondary-700">
                    <div className="flex justify-between">
                      <p>
                        <span className="font-medium">운동: </span>
                        {e.exercise.join(", ")}
                      </p>
                      <p>
                        <span className="font-medium">보증금: </span>
                        {e.deposit.toLocaleString()}원
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p>
                        <span className="font-medium">멤버수: </span>
                        {e.members.length}/{e.people}
                      </p>
                      <p>
                        <span className="font-medium">총합: </span>
                        {e.cashPool.toLocaleString()}원
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p>
                        <span className="font-medium">시작일: </span>
                        {starttime.toISOString().slice(0, 10)}
                      </p>
                      <p>
                        <span className="font-medium">기간: </span> {e.duration}
                        주
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">기간 진행률: </span>
                        <span>{Math.round(durationProgress)}%</span>
                      </div>
                      <div className="w-full bg-secondary-300 rounded-full h-4 relative overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${getColorByProgress(
                            durationProgress
                          )}`}
                          style={{ width: `${durationProgress}%`, zIndex: 10 }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">목표달성 진행률: </span>
                        <span>
                          {done.length}/{e.minFulfill} (
                          {Math.round(achievementProgress)}%)
                        </span>
                      </div>
                      <div className="w-full bg-secondary-300 rounded-full h-4 relative overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${getColorByProgress(
                            achievementProgress
                          )}`}
                          style={{
                            width: `${achievementProgress}%`,
                            zIndex: 10,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <span className="inline-block bg-purple-500 text-white font-bold py-3 px-6 rounded-layout hover:bg-purple-700 transition duration-300">
                      자세히 보기
                    </span>
                  </div>
                </Link>
              );
            })
          ) : (
            <Link
              href="/group"
              className="block bg-gray-100 shadow-md rounded-layout p-12 min-h-[200px] hover:shadow-lg transition duration-300"
            >
              <h2 className="text-2xl font-semibold text-secondary-700 mb-2 text-center">
                아직 소속된 그룹이 없습니다.
              </h2>
              <div className="mt-6 text-center">
                <span className="inline-block bg-purple-500 text-white font-bold py-3 px-6 rounded-layout hover:bg-purple-700 transition duration-300">
                  그룹 목록 보러 가기
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>
    );
  } catch (e) {
    redirect("/login");
  }
}
