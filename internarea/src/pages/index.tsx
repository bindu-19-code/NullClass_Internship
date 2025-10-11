"use client";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  ArrowUpRight,
  Banknote,
  Calendar,
  ChevronRight,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function SvgSlider() {
  const { t } = useTranslation();

  const categories = [
    t("home.categories.bigBrands"),
    t("home.categories.workFromHome"),
    t("home.categories.partTime"),
    t("home.categories.mba"),
    t("home.categories.engineering"),
    t("home.categories.media"),
    t("home.categories.design"),
    t("home.categories.dataScience"),
  ];

  const slides = [
    { pattern: "pattern-1", title: t("home.slides.startCareer"), bgColor: "bg-indigo-600" },
    { pattern: "pattern-2", title: t("home.slides.learnBest"), bgColor: "bg-blue-600" },
    { pattern: "pattern-3", title: t("home.slides.growSkills"), bgColor: "bg-purple-600" },
    { pattern: "pattern-4", title: t("home.slides.connectCompanies"), bgColor: "bg-teal-600" },
  ];

  const stats = [
    { number: "300K+", label: t("home.stats.companiesHiring") },
    { number: "10K+", label: t("home.stats.newOpenings") },
    { number: "21Mn+", label: t("home.stats.activeStudents") },
    { number: "600K+", label: t("home.stats.learners") },
  ];

  const [internships, setInternship] = useState<any>([]);
  const [jobs, setJob] = useState<any>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [internshipRes, jobRes] = await Promise.all([
          axios.get("https://internshala-clone-y2p2.onrender.com/api/internships"),
          axios.get("https://internshala-clone-y2p2.onrender.com/api/job"),
        ]);
        setInternship(internshipRes.data);
        setJob(jobRes.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const filteredInternships = internships.filter(
    (item: any) => !selectedCategory || item.category === selectedCategory
  );
  const filteredJobs = jobs.filter(
    (item: any) => !selectedCategory || item.category === selectedCategory
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t("home.hero.title")}
        </h1>
        <p className="text-xl text-gray-600">{t("home.hero.subtitle")}</p>
      </div>

      {/* Swiper Section */}
      <div className="mb-16">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          className="rounded-xl overflow-hidden shadow-lg"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className={`relative h-[400px] ${slide.bgColor}`}>
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <pattern id={slide.pattern} />
                    <rect x="0" y="0" width="100%" height="100%" fill={`url(#${slide.pattern})`} />
                  </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-4xl font-bold text-white">{slide.title}</h2>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Category Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {t("home.latestInternshipsTitle")}
        </h2>
        <div className="flex flex-wrap gap-4">
          <span className="text-gray-700 font-medium">{t("home.popularCategories")}</span>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Internship Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {filteredInternships.map((internship: any, index: any) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:scale-105 transition-transform">
            <div className="flex items-center gap-2 text-blue-600 mb-4">
              <ArrowUpRight size={20} />
              <span className="font-medium">{t("home.activelyHiring")}</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">{internship.title}</h3>
            <p className="text-gray-500 mb-4">{internship.company}</p>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span>{internship.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Banknote size={18} />
                <span>{internship.stipend}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>{internship.duration}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-6">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">{t("home.internshipLabel")}</span>
              <Link href={`/detailinternship/${internship._id}`} className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                {t("home.viewDetails")} <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Jobs Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("home.latestJobsTitle")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredJobs.map((job: any, index: any) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:scale-105 transition-transform">
              <div className="flex items-center gap-2 text-blue-600 mb-4">
                <ArrowUpRight size={20} />
                <span className="font-medium">{t("home.activelyHiring")}</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">{job.title}</h3>
              <p className="text-gray-500 mb-4">{job.company}</p>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Banknote size={18} />
                  <span>{job.CTC}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>{job.Experience}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-6">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">{t("home.jobsLabel")}</span>
                <Link href={`/detailInternship?q=${job._id}`} className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  {t("home.viewDetails")} <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
