import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext.jsx';
import Field from '../components/Field.jsx';
import FormError from '../components/FormError.jsx';

export default function Login() {
  const { users, setSession } = useLibrary();
  const navigate = useNavigate();
  const [membershipId, setMembershipId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = membershipId.trim().toLowerCase();
    const match = users.find(u => u.membershipId.toLowerCase() === id && u.password === password);
    if (!match) {
      setError('We could not match that membership ID and password.');
      return;
    }
    setError('');
    setSession({ userId: match.id });
    navigate('/dashboard');
  };

  return (
    <div id="loginScreen">
      <div className="library-card">
        <div className="card-stripe"></div>
        <div className="card-eyebrow">MEMBERSHIP LOGIN</div>
        <h1>MISJAY Community Library</h1>
        <p className="tag">Sign in with your membership ID to continue.</p>
        <form noValidate onSubmit={handleSubmit}>
          <Field id="loginMembershipId" label="Membership ID">
            <input type="text" id="loginMembershipId" className="mono" autoComplete="username"
              placeholder="Enter your membership ID" value={membershipId} onChange={e => setMembershipId(e.target.value)} />
          </Field>
          <Field id="loginPassword" label="Password">
            <input type="password" id="loginPassword" autoComplete="current-password"
              value={password} onChange={e => setPassword(e.target.value)} />
          </Field>
          <FormError message={error} />
          <button type="submit" className="btn btn-block">Sign in</button>
        </form>
      </div>
    </div>
  );
}
