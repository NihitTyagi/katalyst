import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'
import { Mail, Phone, User, FileText, ArrowRight, CheckCircle, Clock, Award } from 'lucide-react'

const AffiliatePage = () => {
    const [searchParams] = useSearchParams()
    const referralCode = searchParams.get('ref')

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        project_requirements: '',
    })
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [affiliateName, setAffiliateName] = useState('')

    useEffect(() => {
        if (referralCode) {
            // Fetch affiliate name to personalize the page
            supabase
                .from('affiliates')
                .select('name')
                .eq('referral_code', referralCode)
                .single()
                .then(({ data }) => {
                    if (data) setAffiliateName(data.name)
                })
        }
    }, [referralCode])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (!referralCode) {
                toast.error('Invalid referral link. Please check your link and try again.')
                return
            }

            // Get affiliate ID from referral code
            const { data: affiliate, error: affiliateError } = await supabase
                .from('affiliates')
                .select('id')
                .eq('referral_code', referralCode)
                .single()

            if (affiliateError || !affiliate) {
                toast.error('Invalid referral code. Please contact your referrer.')
                return
            }

            // Check for duplicate email
            const { data: existingLead } = await supabase
                .from('leads')
                .select('id')
                .eq('email', formData.email)
                .single()

            if (existingLead) {
                toast.error('This email has already been submitted. Our team will contact you soon.')
                return
            }

            // Create lead
            const { error } = await supabase
                .from('leads')
                .insert([
                    {
                        affiliate_id: affiliate.id,
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        project_requirements: formData.project_requirements,
                        status: 'Pending',
                    },
                ])

            if (error) throw error

            setSubmitted(true)
            toast.success('Thank you! We will contact you within 24 hours.')
        } catch (error) {
            toast.error('Failed to submit. Please try again or contact us directly.')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // Invalid referral link
    if (!referralCode) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 to-white">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">❌</span>
                    </div>
                    <h1 className="text-3xl font-bold text-dark mb-4">Invalid Referral Link</h1>
                    <p className="text-gray-600 mb-8">
                        This link is missing a referral code. Please contact the person who shared this link with you.
                    </p>
                    <Link to="/" className="btn-primary inline-block">
                        Go to Homepage
                    </Link>
                </div>
            </div>
        )
    }

    // Success state
    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary/5 to-white">
                <div className="text-center max-w-2xl">
                    <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle size={48} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-dark mb-4">Thank You!</h1>
                    <p className="text-xl text-gray-700 mb-6">
                        We've received your project inquiry successfully.
                    </p>
                    <div className="card bg-white max-w-lg mx-auto mb-8">
                        <h2 className="text-lg font-semibold mb-4">What Happens Next?</h2>
                        <div className="space-y-4 text-left">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="text-primary font-bold">1</span>
                                </div>
                                <div>
                                    <p className="font-medium">Review & Analysis</p>
                                    <p className="text-sm text-gray-600">Our team will review your requirements within 2-4 hours</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="text-primary font-bold">2</span>
                                </div>
                                <div>
                                    <p className="font-medium">Contact You</p>
                                    <p className="text-sm text-gray-600">We'll reach out via email or phone within 24 hours</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="text-primary font-bold">3</span>
                                </div>
                                <div>
                                    <p className="font-medium">Consultation Call</p>
                                    <p className="text-sm text-gray-600">Free consultation to discuss your project in detail</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="text-primary font-bold">4</span>
                                </div>
                                <div>
                                    <p className="font-medium">Proposal & Quote</p>
                                    <p className="text-sm text-gray-600">Detailed proposal with timeline and pricing</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-600">
                        Check your email <strong>{formData.email}</strong> for confirmation.
                    </p>
                </div>
            </div>
        )
    }

    // Main form page
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-dark to-dark-light text-white py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Welcome to <span className="text-primary">MT</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 mb-6">
                        Crafting Cutting-Edge Digital Solutions That Scale
                    </p>
                    {affiliateName && (
                        <div className="inline-block bg-primary/20 border-2 border-primary rounded-lg px-6 py-3">
                            <p className="text-lg">
                                Referred by <span className="font-bold text-primary">{affiliateName}</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="card text-center hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="text-primary" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Fast Response</h3>
                        <p className="text-gray-600">
                            Get a response within 24 hours. We value your time and move quickly to understand your needs.
                        </p>
                    </div>

                    <div className="card text-center hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="text-primary" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Quality Excellence</h3>
                        <p className="text-gray-600">
                            Award-winning development team committed to delivering solutions that exceed expectations.
                        </p>
                    </div>

                    <div className="card text-center hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="text-primary" size={32} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Custom Solutions</h3>
                        <p className="text-gray-600">
                            Tailored software solutions designed specifically for your business needs and goals.
                        </p>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-8 md:p-12 mb-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl mb-6 opacity-90">
                        Fill out the form below and let's discuss your project. It only takes 2 minutes!
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle size={20} />
                            <span>Free Consultation</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle size={20} />
                            <span>No Obligation</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle size={20} />
                            <span>24hr Response</span>
                        </div>
                    </div>
                </div>

                {/* Lead Form */}
                <div className="max-w-3xl mx-auto">
                    <div className="card">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-dark mb-2">Share Your Project Details</h2>
                            <p className="text-gray-600">
                                Tell us about your project and we'll get back to you with a tailored solution and quote.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-dark mb-2">
                                    Your Full Name *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input-field pl-11"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-dark mb-2">
                                    Email Address *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input-field pl-11"
                                        placeholder="john@company.com"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">We'll send project updates to this email</p>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-dark mb-2">
                                    Phone Number *
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="input-field pl-11"
                                        placeholder="+91 98765 43210"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">For quick follow-up calls</p>
                            </div>

                            {/* Project Requirements */}
                            <div>
                                <label className="block text-sm font-medium text-dark mb-2">
                                    Project Requirements *
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-4 text-gray-400" size={20} />
                                    <textarea
                                        name="project_requirements"
                                        value={formData.project_requirements}
                                        onChange={handleChange}
                                        className="input-field pl-11 min-h-[150px] resize-y"
                                        placeholder="Tell us about your project:
• What kind of software/app do you need?
• What problems should it solve?
• Who are your target users?
• Timeline expectations?"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">The more details you provide, the better we can help you</p>
                            </div>

                            {/* Referral Code (Read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-dark mb-2">
                                    Referral Code
                                </label>
                                <input
                                    type="text"
                                    value={referralCode}
                                    className="input-field bg-gray-100 cursor-not-allowed"
                                    disabled
                                    readOnly
                                />
                                <p className="text-xs text-gray-500 mt-1">You were referred by {affiliateName || 'a partner'}</p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Submit Project Inquiry</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-500 text-center">
                                By submitting this form, you agree to be contacted by MT regarding your project inquiry.
                                We respect your privacy and will never share your information with third parties.
                            </p>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default AffiliatePage
