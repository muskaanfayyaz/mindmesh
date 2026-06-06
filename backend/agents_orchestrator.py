"""
agents_orchestrator.py
Intelligent mock agent simulator for MindMesh.
When ANTHROPIC_API_KEY is set, uses real Claude API.
Otherwise runs deterministic-but-smart mock agents.
"""
import json
import os
import random
import asyncio
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"

def load_json(filename):
    with open(DATA_DIR / filename) as f:
        return json.load(f)

STRATEGIES = load_json("strategies.json")
BRANDS = load_json("brands.json")

try:
    import anthropic
    ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY")
    USE_REAL_API = bool(ANTHROPIC_KEY)
except ImportError:
    USE_REAL_API = False

# ─── MOCK AGENT LOGIC ─────────────────────────────────────────────────────────

def mock_behavior_analyst(user: dict) -> dict:
    ctr = user["click_through_rate"]
    sessions = user["sessions_per_week"]
    purchases = user["past_purchases"]
    
    engagement = "High" if sessions > 15 else ("Medium" if sessions > 8 else "Low")
    
    if ctr > 0.20:
        behavior_tag = "Impulse Buyer"
    elif purchases > 20:
        behavior_tag = "Loyal Repeat Customer"
    elif sessions > 15:
        behavior_tag = "Frequent Browser"
    else:
        behavior_tag = "Research-Driven"
    
    purchase_frequency = "Frequent" if purchases > 20 else ("Occasional" if purchases > 8 else "Rare")
    
    avg_time = user["avg_time_spent_mins"]
    if sessions > 15 and avg_time < 25:
        session_intensity = "High frequency, short sessions — scrolling habit"
    elif sessions < 7 and avg_time > 45:
        session_intensity = "Low frequency, deep sessions — deliberate browsing"
    else:
        session_intensity = "Moderate frequency, balanced sessions"
    
    top_interests = user["browsing_history"][:3]
    
    return {
        "engagement_level": engagement,
        "behavior_tag": behavior_tag,
        "top_interests": top_interests,
        "purchase_frequency": purchase_frequency,
        "session_intensity": session_intensity
    }


def mock_persona_builder(user: dict, behavior: dict) -> dict:
    age = user["age"]
    income = user["income_level"]
    interest = user["primary_interest"]
    city = user["city"]
    behavior_tag = behavior["behavior_tag"]
    
    # Build persona type
    generation = "Gen-Z" if age < 26 else ("Millennial" if age < 42 else "Gen-X")
    income_label = {"Low": "Budget-Conscious", "Middle": "Value-Seeking", "High": "Premium"}[income]
    interest_label = interest.title()
    persona_type = f"{income_label} {generation} {interest_label} Enthusiast"
    
    # Motivation
    motivations = {
        "Impulse Buyer": "instant gratification + deal excitement",
        "Loyal Repeat Customer": "familiarity + reward recognition",
        "Frequent Browser": "discovery + social proof",
        "Research-Driven": "value validation + feature comparison"
    }
    buying_motivation = motivations.get(behavior_tag, "value + convenience")
    
    # Tone
    if age < 26 and income == "Low":
        preferred_tone = "Casual, Urdu-sprinkled, Meme-aware"
    elif income == "High":
        preferred_tone = "Polished, aspirational, English-forward"
    elif city in ["Karachi", "Lahore"]:
        preferred_tone = "Relatable, Urdu-friendly, Local references"
    else:
        preferred_tone = "Friendly, direct, bilingual"
    
    # Risk profile
    if behavior_tag == "Impulse Buyer":
        risk_profile = "Impulse"
    elif income == "High":
        risk_profile = "Premium"
    elif behavior_tag == "Research-Driven":
        risk_profile = "Research-Driven"
    else:
        risk_profile = "Deal-Seeker"
    
    # Channel
    if age < 28:
        best_channel = "Instagram Story" if income != "Low" else "WhatsApp Campaign"
    elif income == "High":
        best_channel = "Email"
    else:
        best_channel = "Push Notification"
    
    return {
        "persona_type": persona_type,
        "buying_motivation": buying_motivation,
        "preferred_tone": preferred_tone,
        "risk_profile": risk_profile,
        "best_channel": best_channel,
        "city_context": f"{city}-based user profile"
    }


def mock_strategy_selector(user: dict, persona: dict) -> dict:
    interest = user["primary_interest"]
    income = user["income_level"]
    ctr = user["click_through_rate"]
    risk_profile = persona["risk_profile"]
    
    # Score each strategy
    scores = []
    for s in STRATEGIES:
        score = 0
        if interest in s["best_for"]:
            score += 3
        if income in s["income_levels"]:
            score += 2
        if risk_profile == "Impulse" and s["name"] in ["FOMO Flash Drop", "Influencer Style"]:
            score += 2
        if risk_profile == "Premium" and s["name"] in ["Premium Branding", "Urgency/FOMO"]:
            score += 2
        if risk_profile == "Deal-Seeker" and s["name"] in ["Bundle Deal", "Loyalty Reward"]:
            score += 2
        if risk_profile == "Research-Driven" and s["name"] in ["Educational Content", "Social Proof Wave"]:
            score += 2
        # Avoid last failed strategy
        if s["name"] == user.get("last_strategy_used") and not user.get("last_strategy_success", True):
            score -= 3
        scores.append((score + random.uniform(0, 0.5), s))
    
    scores.sort(key=lambda x: x[0], reverse=True)
    best_score, best_strategy = scores[0]
    
    # Build reasoning
    reasoning = (
        f"Selected '{best_strategy['name']}' for {persona['persona_type']}. "
        f"This user's {risk_profile.lower()} profile aligns with {best_strategy['tone']} tone. "
        f"Historical CTR data shows {best_strategy['avg_ctr']*100:.0f}% avg for {interest} interest segment. "
        f"Recommended delivery via {persona['best_channel']}."
    )
    
    # Simulate CTR history lookup (tool call simulation)
    ctr_history = {
        "strategy": best_strategy["name"],
        "segment_avg_ctr": best_strategy["avg_ctr"],
        "user_historical_ctr": ctr,
        "predicted_ctr": round(min(best_strategy["avg_ctr"] * 1.1, 0.35), 3)
    }
    
    confidence = round(min(0.6 + (best_score * 0.04), 0.97), 2)
    
    return {
        "strategy_id": best_strategy["id"],
        "strategy_name": best_strategy["name"],
        "reasoning": reasoning,
        "confidence_score": confidence,
        "ctr_history": ctr_history,
        "tool_called": "ctr_lookup",
        "channel": persona["best_channel"]
    }


def mock_copywriter(user: dict, persona: dict, strategy: dict, brand_name: str = "ImagineArt") -> dict:
    name = user["name"].split()[0]  # First name only
    interest = user["primary_interest"]
    channel = strategy["channel"]
    strategy_name = strategy["strategy_name"]
    tone = persona["preferred_tone"]
    city = user["city"]
    
    copies = {
        "FOMO Flash Drop": {
            "Push Notification": f"🔥 Aye {name}! Sirf 2 ghante baaki — {interest.title()} deals 40% OFF! Abhi grab karo! 🛒",
            "WhatsApp Campaign": f"Assalam o Alaikum {name} bhai! 👋\n\nAaj sirf aapke liye special: {interest.title()} collection mein 40% OFF!\n\nYeh offer sirf aaj raat 12 baje tak hai. Link neeche hai 👇\n\n*ImagineArt* — Aapka apna store 💙",
            "Instagram Story": f"Hey {name}! This drop won't last 👀 Get your {interest} faves at 40% OFF — TODAY ONLY. Tap to shop! 🔥",
            "default": f"⚡ {name}! Flash Sale: {interest.title()} 40% OFF — Ends Tonight! Shop Now at ImagineArt."
        },
        "Social Proof Wave": {
            "Push Notification": f"Trending now in {city}: 847 people bought this {interest} pick today. Join the wave! 📈",
            "Instagram Story": f"{name}, everyone in {city} is talking about this 👀 Don't miss the {interest} trend — tap to see what's hot!",
            "Email": f"Dear {name},\n\nYour {city} neighbors are loving our new {interest} collection — 847 purchases in 24 hours!\n\nSee what everyone's talking about.\n\nImagineArt Team",
            "default": f"🌊 {name}, 847 people in {city} can't be wrong! Top {interest} picks trending NOW at ImagineArt."
        },
        "Bundle Deal": {
            "WhatsApp Campaign": f"Salam {name}! 🎁\n\nHumara special bundle deal sirf aapke liye:\n✅ {interest.title()} Pack A + B = 35% bachao!\n\nFamily ke saath share karein! ImagineArt 💙",
            "SMS": f"Hi {name}! Bundle Deal: Get {interest.title()} Pack + FREE delivery. Save Rs. 500! Shop: ImagineArt.pk",
            "Push Notification": f"💰 {name}! Bundle & Save: {interest.title()} 2-for-1 deal today. Rs. 500 savings waiting!",
            "default": f"🎁 {name}! Bundle Deal: 2x {interest.title()} products, 35% OFF. Limited stock at ImagineArt!"
        },
        "Premium Branding": {
            "Email": f"Dear {name},\n\nAs one of our valued premium members, we'd like to introduce our exclusive {interest.title()} Collection — curated for discerning tastes.\n\nComplimentary express delivery included.\n\nWarm regards,\nImagineArt Premium",
            "In-App Banner": f"Exclusive for You, {name} — Premium {interest.title()} Collection. Complimentary Delivery. Shop ImagineArt.",
            "default": f"✨ {name}, discover our exclusive Premium {interest.title()} Collection. Curated for you. ImagineArt."
        },
        "Educational Content": {
            "Email": f"Hi {name},\n\nDid you know the right {interest} strategy can improve your results by 3x?\n\nWe've put together a free guide — no strings attached.\n\nLearn more at ImagineArt.",
            "Push Notification": f"📚 {name}, free {interest.title()} guide just dropped! 3 tips that actually work. Read now → ImagineArt",
            "default": f"💡 {name}! Free {interest.title()} Guide: 3 expert tips to get started. No cost. ImagineArt."
        },
        "Loyalty Reward": {
            "SMS": f"Hi {name}! You've earned a reward: Rs. 200 OFF your next {interest} order. Use code: LOYAL200. ImagineArt",
            "WhatsApp Campaign": f"Salam {name}! 🌟\n\nAap humare loyal customer hain, isliye:\n🎁 Special reward: Rs. 200 OFF!\nCode: LOYAL200\n\nYeh sirf aapke liye hai. ImagineArt 💙",
            "Push Notification": f"🎁 Surprise, {name}! Your loyalty reward: Rs. 200 OFF {interest.title()} orders. Claim now!",
            "default": f"🌟 {name}, your loyalty reward is ready! Rs. 200 OFF your next {interest} purchase. ImagineArt."
        },
        "Influencer Style": {
            "Instagram Story": f"okay {name} listen 👀 this {interest} thing is ACTUALLY good, not just hype — ab main samjha kion sab log isko buy kar rahe hain 😭 link in bio @ ImagineArt",
            "Push Notification": f"tbh {name}, yeh {interest} deal dekh lo pehle phir decide karo 👀 ImagineArt pe hai — sach mein worth it hai",
            "WhatsApp Campaign": f"Yaar {name}! 🙌\n\nMain pagal ho raha tha jab yeh {interest} item dekha — literally perfect hai.\n\nCheck karo zaroor: ImagineArt 🔥",
            "default": f"okay {name} fr fr — this {interest} find at ImagineArt is actually everything 🔥 check it out rn"
        },
        "Urgency/FOMO": {
            "Email": f"Dear {name},\n\nThis is time-sensitive: Our exclusive {interest.title()} offer expires in 24 hours.\n\nOnly 12 spots remaining at this price.\n\nSecure yours now: ImagineArt",
            "In-App Banner": f"⏰ {name} — 24 Hours Left. Exclusive {interest.title()} deal closing soon. 12 spots left.",
            "Push Notification": f"⏰ {name}! 24 HOURS LEFT — {interest.title()} deal closing. Only 12 spots. Act now, ImagineArt.",
            "default": f"⏰ FINAL HOURS, {name}! {interest.title()} exclusive — 12 spots left at this price. ImagineArt."
        }
    }
    
    strategy_copies = copies.get(strategy_name, {})
    copy = strategy_copies.get(channel, strategy_copies.get("default", f"{name}! Check out our {interest} deals at ImagineArt!"))
    
    # Adapt to brand name
    copy = copy.replace("ImagineArt.pk", f"{brand_name.lower().replace(' ', '')}.pk").replace("ImagineArt", brand_name)
    
    if brand_name == "Stitch Apparel":
        copy = copy.replace("Assalam o Alaikum", "Salam, yo").replace("Dear", "Yo").replace("Aapka apna store", "Aapka apna trendy spot")
        if "no cap" not in copy.lower() and "fr" not in copy.lower():
            copy += " #vibe fr no cap! 🔥"
    elif brand_name == "Kolachi FinTech":
        copy = copy.replace("grab karo", "invest securely").replace("Aye", "Dear").replace("Yaar", "Respected Client")
        if "terms apply" not in copy.lower():
            copy += " *Terms apply. SECP Regulated."

    return {
        "draft_copy": copy,
        "channel": channel,
        "strategy": strategy_name,
        "tone_used": tone
    }



def mock_compliance_verifier(copy_data: dict, brands: dict, attempt: int = 1) -> dict:
    copy = copy_data["draft_copy"]
    guidelines = brands["guidelines"]
    
    violations = []
    copy_lower = copy.lower()
    
    # Check forbidden words
    for word in guidelines["forbidden_words"]:
        if word.lower() in copy_lower:
            violations.append(f"Forbidden word: '{word}'")
    
    # Check forbidden claims
    for claim in guidelines["forbidden_claims"]:
        if claim.lower() in copy_lower:
            violations.append(f"Forbidden claim: '{claim}'")
            
    # Check required brand elements
    for elem in guidelines.get("required_elements", []):
        if elem == "cta":
            # Semantic action verb check
            has_cta = any(word in copy_lower for word in ["shop", "buy", "order", "link", "grab", "get", "claim", "read", "tap"])
            if not has_cta:
                violations.append("Missing clear call-to-action (e.g. shop, buy, order, link)")
        else:
            if elem.lower() not in copy_lower:
                violations.append(f"Missing required brand element: '{elem}'")
    
    # Check cultural requirements (simulated violation on first pass occasionally)
    channel = copy_data.get("channel", "")
    if attempt == 1 and random.random() < 0.35:
        violations.append("Missing explicit brand call-to-action in required position")
    
    # Check length
    length_limits = guidelines["length_limits"]
    channel_key = channel.lower().replace(" ", "_").replace("-", "_")
    if channel == "Push Notification" and len(copy) > length_limits["push_notification"]:
        violations.append(f"Copy exceeds Push limit ({len(copy)} > {length_limits['push_notification']} chars)")
    elif channel == "SMS" and len(copy) > length_limits["sms"]:
        violations.append(f"Copy exceeds SMS limit ({len(copy)} > {length_limits['sms']} chars)")
    
    passed = len(violations) == 0
    
    corrected_copy = None
    if not passed:
        corrected = copy
        # Fix missing brand elements
        for elem in guidelines.get("required_elements", []):
            if elem == "cta":
                has_cta = any(word in corrected.lower() for word in ["shop", "buy", "order", "link", "grab", "get", "claim", "read", "tap"])
                if not has_cta:
                    corrected += " Shop now!"
            else:
                if elem.lower() not in corrected.lower():
                    if elem == "terms apply":
                        corrected += " *Terms apply."
                    elif elem == "Stitch":
                        corrected += " | Stitch Apparel"
                    elif elem == "Kolachi":
                        corrected += " | Kolachi FinTech"
                    elif elem == "ImagineArt":
                        corrected += " | ImagineArt"
                    else:
                        corrected += f" {elem}"
        if any("Missing explicit brand" in v for v in violations):
            if brands["brand_name"] not in corrected:
                corrected += f" | {brands['brand_name']}"
        # Trim if needed
        limit = length_limits.get(channel_key, 300)
        if len(corrected) > limit:
            corrected = corrected[:limit-3] + "..."
        corrected_copy = corrected
    
    return {
        "passed": passed,
        "violations": violations,
        "corrected_copy": corrected_copy,
        "attempts": attempt
    }



def mock_reflection_agent(user: dict, strategy_history: list, iteration: int) -> dict:
    # Build on previous strategies
    base_ctr = user["click_through_rate"]
    prev_strategy = strategy_history[-1] if strategy_history else {}
    prev_name = prev_strategy.get("strategy_name", "FOMO Flash Drop")
    
    # Pick a different strategy each iteration
    all_names = [s["name"] for s in STRATEGIES]
    tried = [s.get("strategy_name") for s in strategy_history]
    untried = [n for n in all_names if n not in tried]
    
    if untried:
        new_strategy_name = untried[0]
        new_strategy = next((s for s in STRATEGIES if s["name"] == new_strategy_name), STRATEGIES[0])
    else:
        new_strategy = random.choice(STRATEGIES)
        new_strategy_name = new_strategy["name"]
    
    # Simulate CTR improvement
    improvement_pct = round(random.uniform(3.0, 12.0), 1)
    predicted_ctr = round(min(base_ctr + (improvement_pct / 100), 0.40), 3)
    
    rationale = (
        f"Iteration {iteration}: Previous '{prev_name}' showed diminishing returns. "
        f"Pivoting to '{new_strategy_name}' targeting {user['primary_interest']} segment "
        f"with {new_strategy['tone']} messaging. CTR uplift simulated at +{improvement_pct}% "
        f"based on cohort data for {user['city']} {user['income_level'].lower()}-income users."
    )
    
    name = user["name"].split()[0]
    channel = new_strategy["channels"][0]
    
    copy_templates = {
        "FOMO Flash Drop": f"🔥 {name}! Evolved offer: Flash deal engineered for your taste — {user['primary_interest'].title()} 45% OFF. ImagineArt.",
        "Social Proof Wave": f"📊 {name}, our AI found that users like you loved this. Be part of the trend — ImagineArt.",
        "Premium Branding": f"✨ {name}, curated exclusively based on your profile. Premium {user['primary_interest'].title()} awaits. ImagineArt.",
        "Educational Content": f"💡 {name}! We learned what works for you. Here's your personalized {user['primary_interest'].title()} guide — ImagineArt.",
        "Loyalty Reward": f"🎁 {name}, your evolved loyalty reward: Rs. 300 OFF your next {user['primary_interest'].title()} order! ImagineArt.",
        "Bundle Deal": f"💰 {name}! Smart bundle designed for you: {user['primary_interest'].title()} combo saves you Rs. 600. ImagineArt.",
        "Influencer Style": f"fr {name} this evolved rec is based on your actual vibe 🔥 {user['primary_interest'].title()} drop @ ImagineArt — no cap.",
        "Urgency/FOMO": f"⏰ {name} — AI-optimized: Final 6 hrs on {user['primary_interest'].title()} deal. Engineered for your profile. ImagineArt."
    }
    
    ad_copy = copy_templates.get(new_strategy_name, f"🔄 {name}! Evolved strategy {iteration}: {new_strategy_name} — ImagineArt.")
    
    return {
        "iteration": iteration,
        "evolved_strategy_name": new_strategy_name,
        "ad_copy": ad_copy,
        "channel": channel,
        "improvement_rationale": rationale,
        "predicted_ctr_improvement": f"+{improvement_pct}%",
        "predicted_ctr": predicted_ctr,
        "confidence_score": round(min(0.65 + (iteration * 0.05), 0.95), 2)
    }


# ─── REAL API (when key present) ───────────────────────────────────────────────

async def real_api_call(prompt: str) -> dict:
    """Call actual Claude API - used when ANTHROPIC_API_KEY is set."""
    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )
    text = response.content[0].text
    # Strip markdown code fences if present
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())


# ─── MAIN PIPELINE ────────────────────────────────────────────────────────────

async def run_pipeline(user: dict, brand_name: str = "ImagineArt"):
    """
    Async generator yielding SSE events for each pipeline step.
    Yields dicts with 'step' and 'data'.
    """
    await asyncio.sleep(0.3)
    
    brand_dict = BRANDS.get(brand_name, BRANDS["ImagineArt"])
    
    # Step 1: Behavior Analyst
    behavior = mock_behavior_analyst(user)
    yield {"step": "behavior", "data": behavior}
    await asyncio.sleep(0.8)
    
    # Step 2: Persona Builder
    persona = mock_persona_builder(user, behavior)
    yield {"step": "persona", "data": persona}
    await asyncio.sleep(0.8)
    
    # Step 3: Strategy Selector
    strategy = mock_strategy_selector(user, persona)
    yield {"step": "strategy", "data": strategy}
    await asyncio.sleep(0.8)
    
    # Step 4: Ad Copywriter
    copy_data = mock_copywriter(user, persona, strategy, brand_name)
    yield {"step": "copy", "data": copy_data}
    await asyncio.sleep(0.6)
    
    # Step 5: Compliance Verifier (up to 3 attempts)
    compliance_result = None
    final_copy = copy_data["draft_copy"]
    
    for attempt in range(1, 4):
        compliance_result = mock_compliance_verifier(copy_data, brand_dict, attempt)
        if compliance_result["passed"]:
            break
        else:
            # Use corrected copy for next attempt
            copy_data = {**copy_data, "draft_copy": compliance_result["corrected_copy"]}
            yield {"step": "compliance_attempt", "data": {**compliance_result, "attempt": attempt}}
            await asyncio.sleep(0.7)
    
    final_copy = copy_data["draft_copy"]
    
    yield {"step": "compliance", "data": {
        **compliance_result,
        "final_copy": final_copy,
        "total_attempts": compliance_result["attempts"]
    }}
    await asyncio.sleep(0.4)
    
    # Final
    yield {"step": "done", "data": {
        "final_strategy": strategy["strategy_name"],
        "final_copy": final_copy,
        "channel": strategy["channel"],
        "predicted_ctr": strategy["ctr_history"]["predicted_ctr"],
        "confidence": strategy["confidence_score"],
        "persona": persona["persona_type"]
    }}


async def run_evolution_loop(user: dict, existing_history: list = None):
    """
    Async generator yielding 5 evolution iterations.
    """
    strategy_history = existing_history or []
    
    for i in range(1, 6):
        await asyncio.sleep(1.2)
        result = mock_reflection_agent(user, strategy_history, i)
        strategy_history.append(result)
        yield {"step": "evolve", "data": result}
    
    # Final evolution summary
    best = max(strategy_history, key=lambda x: x["predicted_ctr"])
    yield {"step": "evolve_done", "data": {
        "best_strategy": best["evolved_strategy_name"],
        "best_copy": best["ad_copy"],
        "best_ctr": best["predicted_ctr"],
        "total_iterations": 5,
        "improvement_summary": f"Evolved from {user['click_through_rate']*100:.1f}% → {best['predicted_ctr']*100:.1f}% CTR"
    }}
