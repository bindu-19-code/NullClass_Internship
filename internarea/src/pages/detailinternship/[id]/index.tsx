import selectUser from "@/Feature/Userslice";
import axios from "axios";
import {
  ArrowUpRight,
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  MapPin,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

// 🔹 Type definitions
interface User {
  _id: string; // MongoDB user ID
  uid: string; // Firebase UID
  name: string | null;
  email: string | null;
  photo: string | null;
  phoneNumber: string | null;
  plan: "free" | "bronze" | "silver" | "gold";
}

interface Internship {
  _id: string;
  title: string;
  company: string;
  category: string;
  location: string;
  stipend: string;
  startDate: string;
  aboutCompany: string;
  aboutInternship: string;
  whoCanApply: string;
  perks: string;
  additionalInfo: string;
  numberOfOpening: string;
  createdAt: string;
}

const Index: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [internshipData, setInternship] = useState<Internship | null>(null);
  const [availability, setAvailability] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const user = useSelector((state: any) => state.user.user) as User | null;

  console.log("Redux user state:", user);

  // Fetch internship data
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(`https://nullclass-internship-1gk4.onrender.com/api/internship/${id}`);
        setInternship(res.data);
      } catch (err) {
        console.warn("Backend not reachable, using mock data");
        const mock: Internship = {
          _id: id as string,
          title: "Frontend Developer Intern",
          company: "Tech Innovators",
          category: "Development",
          location: "Remote",
          stipend: "$500/month",
          startDate: "March 15, 2025",
          aboutCompany:
            "Tech Innovators is a leading software development company specializing in modern web applications.",
          aboutInternship:
            "As a Frontend Developer Intern, you will work on real-world projects using React.js and Tailwind CSS.",
          whoCanApply:
            "Students and fresh graduates with knowledge of HTML, CSS, JavaScript, and React.js.",
          perks: "Certificate, Letter of Recommendation, Flexible Work Hours",
          additionalInfo: "This is a remote internship with flexible working hours.",
          numberOfOpening: "2",
          createdAt: "2025-09-23",
        };
        setInternship(mock);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmitApplication = async () => {
    if (!user) {
      toast.error("Please login to apply");
      return;
    }

    if (!coverLetter.trim()) {
      toast.error("Please write a cover letter");
      return;
    }

    if (!availability) {
      toast.error("Please select your availability");
      return;
    }

    try {
      // 1️⃣ Get user applications from backend
      const res = await axios.get(
        `https://nullclass-internship-1gk4.onrender.com/api/application/user/${user.uid}`
      );
      const userApplications = res.data;

      // 2️⃣ Check plan limits
      const planLimits: { [key: string]: number } = {
        free: 1,
        bronze: 3,
        silver: 5,
        gold: Infinity,
      };
      const maxApplications = planLimits[user.plan || "free"];

      if (userApplications.length >= maxApplications) {
        toast.error(
          `Your plan (${user.plan}) allows only ${maxApplications} applications. Please upgrade your plan.`
        );
        return;
      }

      // 3️⃣ Submit application
      const applicationData = {
        userId: user._id,
        internshipId: internshipData!._id,
        coverLetter,
        availability,
      };

      await axios.post("https://nullclass-internship-1gk4.onrender.com/api/application", applicationData, {
        withCredentials: true,
      });

      toast.success("Application submitted successfully!");
      router.push("/internship");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit application");
    }
  };

  if (!internshipData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2 text-blue-600 mb-4">
            <ArrowUpRight className="h-5 w-5" />
            <span className="font-medium">Actively Hiring</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {internshipData.title}
          </h1>
          <p className="text-lg text-gray-600 mb-4">{internshipData.company}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-5 w-5" />
              <span>{internshipData.location}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <DollarSign className="h-5 w-5" />
              <span>{internshipData.stipend}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="h-5 w-5" />
              <span>{internshipData.startDate}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <Clock className="h-4 w-4 text-green-500" />
            <span className="text-green-500 text-sm">
              Posted on {internshipData.createdAt}
            </span>
          </div>
        </div>

        {/* Company Info */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            About {internshipData.company}
          </h2>
          <a
            href="#"
            className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 mb-4"
          >
            <span>Visit company website</span>
            <ExternalLink className="h-4 w-4" />
          </a>
          <p className="text-gray-600">{internshipData.aboutCompany}</p>
        </div>

        {/* Internship Details */}
        <div className="p-6 border-b space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              About the Internship
            </h2>
            <p className="text-gray-600">{internshipData.aboutInternship}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Who can apply
            </h3>
            <p className="text-gray-600">{internshipData.whoCanApply}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Perks</h3>
            <p className="text-gray-600">{internshipData.perks}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Additional Information
            </h3>
            <p className="text-gray-600">{internshipData.additionalInfo}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Number of Openings
            </h3>
            <p className="text-gray-600">{internshipData.numberOfOpening}</p>
          </div>
        </div>

        {/* Apply Button */}
        <div className="p-6 flex justify-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-150"
          >
            Apply Now
          </button>
        </div>
      </div>

      {/* Apply Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Apply to {internshipData.company}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Cover Letter
                </h3>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Write your cover letter here..."
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Your Availability
                </h3>
                <div className="space-y-3">
                  {[
                    "Yes, I am available to join immediately",
                    "No, I am currently on notice period",
                    "No, I will have to serve notice period",
                    "Other",
                  ].map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="availability"
                        value={option}
                        checked={availability === option}
                        onChange={(e) => setAvailability(e.target.value)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end pt-4">
                {user ? (
                  <button
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    onClick={handleSubmitApplication}
                  >
                    Submit Application
                  </button>
                ) : (
                  <Link
                    href="/"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Sign up to apply
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
