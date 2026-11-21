import React,{useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {supabase,errorText} from './supabase';
import {MyCertificates} from './FellowshipCertificates.jsx';

export default function MyAccount({user,onUpdated}){
 const [fullName,setFullName]=useState('');
 const [phone,setPhone]=useState('');
 const [city,setCity]=useState('');
 const [bio,setBio]=useState('');
 const [role,setRole]=useState('student');
 const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[profileMessage,setProfileMessage]=useState('');
 const [currentPassword,setCurrentPassword]=useState(''),[newPassword,setNewPassword]=useState(''),[confirmPassword,setConfirmPassword]=useState('');
 const [passwordBusy,setPasswordBusy]=useState(false),[passwordMessage,setPasswordMessage]=useState('');
 useEffect(()=>{
  let active=true;
  async function load(){
   const {data,error}=await supabase.from('profiles').select('full_name,phone_number,city,about_me,role').eq('id',user.id).maybeSingle();
   if(!active)return;
   setLoading(false);
   if(error){setProfileMessage(errorText(error));return}
   if(data){setFullName(data.full_name||'');setPhone(data.phone_number||'');setCity(data.city||'');setBio(data.about_me||'');setRole(data.role||'student')}
  }
  load();
  return()=>{active=false}
 },[user.id]);
 async function saveProfile(e){
  e.preventDefault();
  if(!fullName.trim()||fullName.trim().length<2){setProfileMessage('Enter your full name (at least two characters).');return}
  setSaving(true);setProfileMessage('');
  const {data,error}=await supabase.rpc('update_my_fellowship_profile',{p_full_name:fullName.trim(),p_phone_number:phone.trim(),p_city:city.trim(),p_about_me:bio.trim()});
  setSaving(false);
  if(error){setProfileMessage(errorText(error));return}
  setFullName(data?.full_name||fullName.trim());
  setProfileMessage('Your profile has been updated successfully.');
  onUpdated?.();
 }
 async function updatePassword(e){
  e.preventDefault();
  if(newPassword.length<8){setPasswordMessage('Your new password must be at least 8 characters long.');return}
  if(newPassword!==confirmPassword){setPasswordMessage('Your new passwords do not match.');return}
  if(currentPassword===newPassword){setPasswordMessage('Choose a new password that differs from your current password.');return}
  setPasswordBusy(true);setPasswordMessage('');
  const {error:confirmError}=await supabase.auth.signInWithPassword({email:user.email,password:currentPassword});
  if(confirmError){setPasswordBusy(false);setPasswordMessage('Your current password could not be verified. Please check it and try again.');return}
  const {error:changeError}=await supabase.auth.updateUser({password:newPassword});
  setPasswordBusy(false);
  if(changeError){setPasswordMessage(errorText(changeError));return}
  setCurrentPassword('');setNewPassword('');setConfirmPassword('');
  setPasswordMessage('Your password has been changed. Use your new password the next time you sign in.');
 }
 return <main className="wrap mari-account-page">
  <div className="account-heading"><div className="eyebrow">MARI MATTERS · MY ACCOUNT</div><h1>Account settings</h1><p>Update your profile, manage your personal details and secure your fellowship account.</p></div>
  <div className="account-overview"><div className="account-avatar" aria-hidden="true">{(fullName||user.email||'M').trim().slice(0,1).toUpperCase()}</div><div><strong>{fullName||'My Mari Matters account'}</strong><span>{user.email}</span><small>{role==='admin'?'Administrator':'Fellow'} account</small></div></div>
  <MyCertificates userId={user.id} compact/>
  <div className="account-sections">
   <section className="panel account-form-card" aria-labelledby="account-personal-heading">
    <div className="account-section-icon" aria-hidden="true">✦</div><h2 id="account-personal-heading">My profile</h2><p>Make sure your details are accurate. Your email address and your account permissions are managed separately.</p>
    {loading?<p>Loading your profile...</p>:<form onSubmit={saveProfile} className="account-fields">
     <label>Full name <span className="account-required">Required</span><input autoComplete="name" type="text" required maxLength={120} value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your full name"/></label>
     <label>Email address <span className="account-readonly">Login email</span><input type="email" readOnly value={user.email||''} aria-describedby="email-restriction"/><small id="email-restriction">Your sign-in email cannot be changed from this form.</small></label>
     <label>Phone number <span className="account-optional">Optional</span><input autoComplete="tel" type="tel" maxLength={40} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="e.g. +263 7…"/></label>
     <label>City / town <span className="account-optional">Optional</span><input autoComplete="address-level2" maxLength={100} value={city} onChange={e=>setCity(e.target.value)} placeholder="e.g. Harare"/></label>
     <label className="account-full-width">About me <span className="account-optional">Optional</span><textarea rows={4} maxLength={600} value={bio} onChange={e=>setBio(e.target.value)} placeholder="Tell us a little about yourself and why financial literacy matters to you."/><small>{bio.length}/600 characters</small></label>
     <div className="account-form-footer"><button type="submit" disabled={saving}>{saving?'Saving profile...':'Save profile changes'}</button>{profileMessage&&<p role="status" className="account-message">{profileMessage}</p>}</div>
    </form>}
   </section>
   <section className="panel account-form-card" aria-labelledby="account-security-heading">
    <div className="account-section-icon account-icon-blue" aria-hidden="true">🔒</div><h2 id="account-security-heading">Security & password</h2><p>Change your password while signed in. For your protection, we'll check your existing password first.</p>
    <form onSubmit={updatePassword} className="account-password-fields">
     <label>Current password<input autoComplete="current-password" type="password" required value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)}/></label>
     <label>New password<input autoComplete="new-password" type="password" required minLength={8} value={newPassword} onChange={e=>setNewPassword(e.target.value)}/><small>Use at least 8 characters, ideally a mix of letters, numbers and symbols.</small></label>
     <label>Confirm new password<input autoComplete="new-password" type="password" required minLength={8} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/></label>
     <div className="account-form-footer"><button type="submit" disabled={passwordBusy}>{passwordBusy?'Updating password...':'Change password'}</button>{passwordMessage&&<p role="status" className="account-message">{passwordMessage}</p>}</div>
    </form>
    <div className="account-help"><strong>Forgot your current password?</strong><p>Use the email recovery option instead. If email delivery is restricted, your administrator can help with the supported account-recovery process.</p><Link to="/forgot-password">Reset via email →</Link></div>
   </section>
  </div>
 </main>
}
