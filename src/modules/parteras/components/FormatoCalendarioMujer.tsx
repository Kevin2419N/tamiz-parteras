import React from 'react';
import { CalendarioMujer } from '../CalendarioMujer';
import type { CalendarioMujerProps } from '../CalendarioMujer';

export const FormatoCalendarioMujer: React.FC<CalendarioMujerProps> = (props) => {
    return <CalendarioMujer {...props} />;
};

export default FormatoCalendarioMujer;
