# Password Authentication Fix - Bcrypt 72-byte Limitation

## Issue Summary

The application was experiencing a `ValueError` during authentication:

```
ValueError: password cannot be longer than 72 bytes, truncate manually if necessary (e.g. my_password[:72])
```

This error occurred when passlib's bcrypt handler tried to initialize and test the bcrypt backend with a long test password that exceeded bcrypt's 72-byte limit.

## Root Cause

1. **Bcrypt Limitation**: The bcrypt algorithm has a hard limit of 72 bytes for password length. This is a known limitation of the bcrypt specification.

2. **Version Incompatibility**: The issue was caused by incompatibility between:
   - `passlib==1.7.4` (last stable release, from 2020)
   - `bcrypt==5.0.0` (newer version with stricter validation)
   
   Passlib 1.7.4 runs internal tests during initialization that create test passwords exceeding 72 bytes to detect certain bcrypt implementation bugs. Newer versions of bcrypt (4.x and 5.x) enforce the 72-byte limit more strictly, causing these initialization tests to fail.

## Solution

### 1. Downgrade bcrypt to Compatible Version

**File Modified**: `requirements.txt`

Changed from:
```
passlib[bcrypt]==1.7.4
```

To:
```
passlib==1.7.4
bcrypt==3.2.0
```

**Reason**: bcrypt 3.2.0 is the last version known to work well with passlib 1.7.4. It's more lenient with the 72-byte limit during initialization while still enforcing it during actual password operations.

### 2. Add Password Truncation Helper

**File Modified**: `app/routes/auth.py`

Added a helper function to safely truncate passwords:

```python
def _truncate_password(password: str) -> str:
    """
    Truncate password to 72 bytes for bcrypt compatibility.
    Bcrypt has a maximum password length of 72 bytes.
    """
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        # Truncate to 72 bytes, ensuring we don't cut in the middle of a multi-byte character
        truncated = password_bytes[:72]
        # Decode, ignoring any incomplete multi-byte sequences at the end
        return truncated.decode('utf-8', errors='ignore')
    return password
```

Updated both `verify_password()` and `get_password_hash()` to use this helper.

## Testing

A comprehensive test script was created at `backend/test_auth.py` that verifies:

1. ✅ Normal password hashing and verification
2. ✅ Long passwords (under 72 bytes)
3. ✅ Passwords at exactly 72 bytes
4. ✅ Passwords over 72 bytes (automatic truncation)
5. ✅ Demo account credentials
6. ✅ Wrong password rejection

All tests pass successfully.

## Implementation Details

### Bcrypt 72-byte Limit Handling

- **ASCII passwords**: 72 characters = 72 bytes (no truncation needed for most cases)
- **UTF-8 multi-byte characters**: May require fewer characters to reach 72 bytes
- **Automatic truncation**: The helper function safely truncates at 72 bytes without breaking multi-byte UTF-8 sequences

### Why This Approach Works

1. **Transparent to users**: Passwords under 72 bytes (99% of use cases) work without any changes
2. **Consistent hashing**: Same password always produces verifiable hash, even if over 72 bytes
3. **UTF-8 safe**: Properly handles multi-byte characters without corruption
4. **Backward compatible**: Existing hashed passwords continue to work

## Security Considerations

### Is 72 bytes enough?

**Yes.** For security:

- 72 bytes = 72 ASCII characters or approximately 18-72 Unicode characters
- NIST recommends passwords between 8-64 characters
- Most password managers generate 20-30 character passwords
- The entropy of a 72-byte random password far exceeds cryptographic security requirements

### Bcrypt Strength

- Bcrypt uses adaptive hashing with configurable cost factor (default: 12 rounds)
- Each round doubles the computation time, making brute-force attacks impractical
- The 72-byte limit is a bcrypt specification constraint, not a security weakness

## Migration Notes

### For Existing Deployments

1. **No database migration needed**: Existing password hashes remain valid
2. **No user action required**: Users can continue logging in with existing passwords
3. **Transparent change**: The 72-byte truncation is handled automatically

### For New Deployments

1. Install dependencies: `pip install -r requirements.txt`
2. Verify bcrypt version: `pip show bcrypt` should show `3.2.0`
3. Run tests: `python test_auth.py`

## Alternative Solutions Considered

### 1. Upgrade to passlib2 or argon2

**Pros**: Modern password hashing, better security
**Cons**: Requires password hash migration, breaking change for existing users

**Decision**: Deferred for future major version upgrade

### 2. Use bcrypt directly without passlib

**Pros**: Full control over bcrypt usage
**Cons**: Loss of passlib's context management and hash format flexibility

**Decision**: Current solution maintains compatibility while fixing the issue

### 3. Hash passwords with SHA-256 before bcrypt

**Pros**: Removes length limitation
**Cons**: Additional complexity, potential security concerns with pre-hashing

**Decision**: Not necessary; 72 bytes is sufficient

## Future Recommendations

1. **Consider Argon2**: For future major versions, consider migrating to Argon2id (modern password hashing standard)
2. **Password policy**: Document maximum password length in user-facing documentation
3. **Monitoring**: Log warnings if users attempt passwords near the 72-byte limit

## References

- [Bcrypt Specification](https://en.wikipedia.org/wiki/Bcrypt)
- [Passlib Documentation](https://passlib.readthedocs.io/)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

## Version History

- **2024-02-02**: Initial fix implemented
  - Downgraded bcrypt to 3.2.0
  - Added password truncation helper
  - Created test suite
  - Documented solution