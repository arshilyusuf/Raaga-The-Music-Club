"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ShinyText from "@/Reactbits/ShinyText";
import Grainient from "@/Reactbits/Grainient";
import { AnimatePresence, motion } from "framer-motion";

export default function Page() {
  const router = useRouter();
  const [type, setType] = useState<"vocal" | "instrumental">("vocal");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const DEADLINE = new Date("2026-09-04T18:29:59").getTime();
  const [windowOpen, setWindowOpen] = useState(() => Date.now() < DEADLINE);
  useEffect(() => {
    // If it's already closed, no need to run a timer
    if (!windowOpen) return;

    const checkDeadline = () => {
      if (Date.now() >= DEADLINE) {
        setWindowOpen(false);
        clearInterval(interval);
      }
    };

    // Run an initial check immediately
    checkDeadline();

    // Check every second to close it exactly on time
    const interval = setInterval(checkDeadline, 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [windowOpen]);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    roll_number: "",
    branch: "",
    year: "",
    phone_number: "",
    languages: "",
    backing_track_links: "",
    instruments: [] as string[],
    needs_instrument: false,
    remarks: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "phone_number") {
      setFormData((prev) => ({
        ...prev,
        phone_number: value.replace(/\D/g, "").slice(0, 10),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleInstrumentChange = (inst: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      instruments: checked
        ? [...prev.instruments, inst]
        : prev.instruments.filter((i) => i !== inst),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Date.now() >= DEADLINE) {
      setSubmitError(
        "The deadline for registrations has passed. Submissions are now closed.",
      );

      return;
    }
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          roll_number: formData.roll_number,
          branch: formData.branch,
          year: formData.year,
          phone_number: formData.phone_number,
          languages: formData.languages,
          backing_track_links: formData.backing_track_links,
          instruments: formData.instruments,
          needs_instrument: formData.needs_instrument,
          remarks: formData.remarks,
          registration_type: type === "vocal" ? "vocalist" : "instrumentalist",
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setSubmitError(
            json?.error || "You have already registered in this category.",
          );
        }
        // Keep your fallback phone number error matching if still needed
        else if (
          json?.error?.includes("unique_phone_per_type") ||
          json?.error?.includes("phone_number")
        ) {
          setSubmitError(
            "You have already registered as " +
              (type === "vocal" ? "a vocalist" : "an instrumentalist") +
              ". You cannot register in the same category twice.",
          );
        } else {
          setSubmitError("Something went wrong. Please try again.");
        }
        setSubmitting(false);
        return;
      }

      // Show success notification then redirect
      setSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const colors = useMemo(() => {
    if (type === "vocal") {
      return { c1: "#9ea317", c2: "#696331", c3: "#ab9e49" };
    } else {
      return { c1: "#0e625c", c2: "#44a29f", c3: "#074d54" };
    }
  }, [type]);

  const fieldVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.3 } },
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col justify-center items-center px-6 sm:py-12 py-20">
      {/* Loading overlay */}
      {submitting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin mb-4" />
          <p className="text-white font-semibold text-lg">
            Submitting your registration...
          </p>
        </div>
      )}

      {/* Success notification */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-white font-bold text-2xl">
              Registration Successful!
            </p>
          </motion.div>
        </div>
      )}

      <div className="absolute inset-0 -z-10">
        <Grainient
          color1={colors.c1}
          color2={colors.c2}
          color3={colors.c3}
          timeSpeed={0.25}
          colorBalance={0}
          warpStrength={3.35}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={114}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={3.3}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={1.6}
        />
      </div>
      {windowOpen ? (
        <>
          <ShinyText
            text="REGISTER FOR THE AUDITIONS"
            speed={4}
            color="#ffffff"
            shineColor={colors.c1}
            spread={120}
            direction="left"
            className="text-3xl font-bold mb-8"
          />

          <fieldset
            disabled={submitting || showSuccess}
            className="w-full max-w-4xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div className="flex gap-6 mb-6 w-full max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => setType("vocal")}
                  className={`flex-1 px-6 py-2 border border-white font-semibold transition-all duration-300 active:scale-90
                ${type === "vocal" ? "bg-white text-black scale-105" : "bg-transparent text-white hover:bg-white/20"}`}
                >
                  Vocalist
                </button>
                <button
                  type="button"
                  onClick={() => setType("instrumental")}
                  className={`flex-1 px-6 py-2 border border-white font-semibold transition-all duration-300 active:scale-90
                ${type === "instrumental" ? "bg-white text-black scale-105" : "bg-transparent text-white hover:bg-white/20"}`}
                >
                  Instrumentalist
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 flex flex-col">
                  <label className="font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    placeholder="Enter full name"
                    className="input"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Roll/Enrollment</label>
                  <input
                    type="text"
                    name="roll_number"
                    placeholder="Enter roll or enrollment number if not alloted"
                    className="input"
                    value={formData.roll_number}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    className="input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Branch</label>
                  <select
                    name="branch"
                    className="input"
                    value={formData.branch}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Branch</option>
                    <option value="Bio-Medical Engineering">
                      Bio-Medical Engineering
                    </option>
                    <option value="Bio Technology">Bio Technology</option>
                    <option value="Chemical Engineering">
                      Chemical Engineering
                    </option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Computer Science & Engineering">
                      Computer Science & Engineering
                    </option>
                    <option value="Electronics and Communication Engineering">
                      Electronics and Communication Engineering
                    </option>
                    <option value="Electrical Engineering">
                      Electrical Engineering
                    </option>
                    <option value="Information Technology">
                      Information Technology
                    </option>
                    <option value="Mechanical Engineering">
                      Mechanical Engineering
                    </option>
                    <option value="Metallurgical and Materials Engineering">
                      Metallurgical and Materials Engineering
                    </option>
                    <option value="Mining Engineering">
                      Mining Engineering
                    </option>
                    <option value="B.Arch.">B.Arch.</option>
                    <option value="M.Tech.">M.Tech.</option>
                    <option value="MCA">MCA</option>
                    <option value="M.Sc.">M.Sc.</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold mb-1">Year</label>
                  <select
                    name="year"
                    className="input"
                    value={formData.year}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                  </select>
                </div>

                <div className="flex flex-col col-span-2">
                  <label className="font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    placeholder="Enter phone number"
                    className="input"
                    value={formData.phone_number}
                    onChange={handleChange}
                    pattern="\d{10}"
                    maxLength={10}
                    required
                  />
                </div>
                <AnimatePresence mode="wait">
                  {type === "vocal" && (
                    <motion.div
                      className="col-span-2 flex flex-col space-y-4"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={fieldVariants}
                    >
                      <div className="flex flex-col">
                        <label className="font-semibold mb-1">
                          Languages You Sing In
                        </label>
                        <input
                          type="text"
                          name="languages"
                          placeholder="Enter languages"
                          className="input"
                          value={formData.languages}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="flex text-[0.9rem] sm:text-lg flex-col">
                        <label className="font-semibold mb-1">
                          Links to Backing Tracks / Karaoke (if any)
                        </label>
                        <input
                          type="text"
                          name="backing_track_links"
                          placeholder="Paste YouTube/Drive karaoke link(s) here"
                          className="input"
                          value={formData.backing_track_links}
                          onChange={handleChange}
                        />
                      </div>
                    </motion.div>
                  )}

                  {type === "instrumental" && (
                    <motion.div
                      className="col-span-2 space-y-4"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={fieldVariants}
                    >
                      <p className="mb-2 font-semibold">Instruments</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm">
                        {[
                          "Guitar",
                          "Keyboard",
                          "Drums",
                          "Violin",
                          "Harmonium",
                          "Flute",
                          "Tabla/Dholak",
                          "Sitar",
                          "Beatbox",
                          "Production",
                          "Other",
                        ].map((inst) => (
                          <label
                            key={inst}
                            className="flex items-center gap-2 cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              name="instruments"
                              value={inst}
                              className="peer hidden"
                              checked={formData.instruments.includes(inst)}
                              onChange={(e) =>
                                handleInstrumentChange(inst, e.target.checked)
                              }
                            />
                            <span className="w-5 h-5 rounded border-2 border-white shrink-0 flex items-center justify-center peer-checked:bg-white transition-colors duration-200">
                              <span
                                className="w-2.5 h-2.5 rounded"
                                style={{ backgroundColor: colors.c1 }}
                              />
                            </span>
                            <span className="text-white">{inst}</span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-4 border-t">
                        <label className="flex mt-3 items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            name="requireInstrument"
                            className="peer hidden"
                            checked={formData.needs_instrument}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                needs_instrument: e.target.checked,
                              }))
                            }
                          />
                          <span className="w-5 h-5 rounded border-2 border-white flex items-center justify-center peer-checked:bg-white transition-colors duration-200">
                            <span
                              className="w-2.5 h-2.5 rounded"
                              style={{ backgroundColor: colors.c1 }}
                            />
                          </span>
                          <span className="text-white font-semisemibold sm:text-lg text-[0.99rem]">
                            Requirement for instrument from our side
                          </span>
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="col-span-2 flex flex-col">
                  <label className="font-semibold mb-1">
                    Remarks (optional)
                  </label>
                  <input
                    type="text"
                    name="remarks"
                    placeholder="Enter remarks"
                    className="input"
                    value={formData.remarks}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {submitError && (
                <p className="text-red-300 text-sm text-center bg-red-950/40 border border-red-800 rounded-lg px-4 py-3">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                className="mt-6 w-full border border-white py-3 font-semibold hover:bg-white hover:text-black transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit Registration
              </button>
            </form>
          </fieldset>
          <div className="mt-6 rounded-xl border border-white/20 bg-white/5 p-4 sm:p-6">
            {type === "vocal" ? (
              <>
                <h3 className="mb-4 text-lg font-bold uppercase text-white">
                  Vocals
                </h3>

                <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-gray-200 marker:text-yellow-400">
                  <li>
                    Prepare two songs of different genres with their respective
                    karaoke tracks.
                  </li>
                  <li>
                    Choose songs that best showcase your vocal versatility and
                    style.
                  </li>
                  <li>
                    Your performance will be assessed on key musical parameters
                    including scale accuracy, tempo, pitch, rhythm, vocal range,
                    expression, and stage presence.
                  </li>
                  <li>
                    <strong>Note:</strong> We encourage everyone to participate
                    in the auditions, regardless of their experience or chances
                    of selection.
                  </li>
                </ul>
              </>
            ) : (
              <>
                <h3 className="mb-4 text-lg font-bold uppercase text-white">
                  Instrument
                </h3>

                <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-gray-200 marker:text-yellow-400">
                  <li>
                    Prepare two songs of your choice that best showcase your
                    ability, musicality, and overall performance.
                  </li>
                  <li>
                    Be familiar with basic music theory, including concepts such
                    as scales, chord progressions, rhythm, and keys.
                  </li>
                  <li>
                    <strong>Percussionists:</strong> You shall prepare a song
                    wherein your instrument plays a dominant role in its
                    arrangement. All the fillers, beats, transitions, etc.
                    should be neatly placed.
                  </li>
                  <li>
                    <strong>Tabla, Dholak and Octapad players:</strong> Should
                    be able to play the respective instrument's sync to
                    accompany the vocalists (song will be played on speaker, it
                    shall be disclosed then and there itself).
                  </li>
                  <li>
                    <strong>Note:</strong> We encourage everyone to participate
                    in the auditions, regardless of their experience or chances
                    of selection.
                  </li>
                </ul>
              </>
            )}
          </div>
          <p className="text-gray-300 mt-10 text-sm flex flex-col sm:flex-row items-start sm:items-center bg-[#4A5919]/40 border border-gray-100 rounded-lg px-4 py-3">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0 text-black bg-white backdrop-blur-sm text-xs mb-2 sm:mb-0">
              i
            </span>
            <span className="mx-3 flex flex-col items-center gap-2 text-center sm:text-left">
              <span className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                <span>For any queries, contact us at</span>

                <span className="sm:ml-3 flex flex-col sm:flex-row sm:flex-wrap items-center gap-1 sm:gap-2">
                  <a
                    href="tel:8349816667"
                    className="text-white font-semibold hover:underline"
                  >
                    8349816667 - Debanjan
                  </a>

                  <span className="hidden sm:inline">|</span>

                  <a
                    href="tel:9302689470"
                    className="text-white font-semibold hover:underline"
                  >
                    9302689470 - Himanshu
                  </a>
                </span>
              </span>

              {/* <span>
                For other domains like anchoring, video editing, photography,
                design & volunteering, register{" "}
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfcsd8fTXwYazJwQggAtQiaJwRJYNkqllKWev4gyNVOGbc1aA/viewform"
                  className="text-yellow-200 hover:underline"
                >
                  here
                </a>
                .
              </span> */}
            </span>
          </p>
        </>
      ) : (
        <div className="flex flex-col bg-[#252e08]/20 backdrop-blur-sm rounded-lg p-8 items-center gap-6">
          <ShinyText
            text="REGISTRATIONS CLOSED"
            speed={4}
            color="#ffffff"
            shineColor={colors.c3}
            spread={100}
            direction="left"
            className="text-3xl font-bold mb-4"
          />
          <p className="text-white text-xl">
            The Auditions are not open for registration at the moment.
          </p>
        </div>
      )}
    </div>
  );
}
