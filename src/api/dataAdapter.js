import { supabase } from './supabaseClient';

const SORT_COLUMN_MAP = {
  created_date: 'created_at',
};

function parseSort(sort) {
  if (!sort) return { column: 'created_at', ascending: false };
  const desc = sort.startsWith('-');
  const raw = desc ? sort.slice(1) : sort;
  const column = SORT_COLUMN_MAP[raw] || raw;
  return { column, ascending: !desc };
}

function mapRow(row) {
  if (!row) return row;
  if (row.created_at !== undefined) {
    row.created_date = row.created_at;
  }
  return row;
}

function mapRows(rows) {
  return (rows || []).map(mapRow);
}

function throwSupabaseError(error) {
  const err = new Error(error.message || 'Database operation failed');
  err.code = error.code;
  err.status = 400;
  throw err;
}

const SCHEMA_CACHE_HINT = 'schema cache';

function isSchemaCacheError(error) {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  return msg.includes(SCHEMA_CACHE_HINT) || error.code === 'PGRST205';
}

async function withSchemaRetry(fn) {
  try {
    return await fn();
  } catch (err) {
    if (isSchemaCacheError(err)) {
      await new Promise((r) => setTimeout(r, 2000));
      return fn();
    }
    throw err;
  }
}

function makeEntity(table) {
  return {
    async list(sort, limit) {
      return withSchemaRetry(async () => {
        const { column, ascending } = parseSort(sort);
        let query = supabase.from(table).select('*').order(column, { ascending });
        if (limit) query = query.limit(limit);
        const { data, error } = await query;
        if (error) throwSupabaseError(error);
        return mapRows(data);
      });
    },

    async create(payload) {
      const { data, error } = await supabase
        .from(table)
        .insert(payload)
        .select('*')
        .single();
      if (error) throwSupabaseError(error);
      return mapRow(data);
    },

    async update(id, payload) {
      const { data, error } = await supabase
        .from(table)
        .update(payload)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throwSupabaseError(error);
      return mapRow(data);
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throwSupabaseError(error);
    },

    async deleteMany(filter) {
      let query = supabase.from(table).delete();
      if (filter && Object.keys(filter).length > 0) {
        query = query.match(filter);
      } else {
        query = query.neq('id', '00000000-0000-0000-0000-000000000000');
      }
      const { error } = await query;
      if (error) throwSupabaseError(error);
    },

    async filter(filters, sort, limit) {
      return withSchemaRetry(async () => {
        const { column, ascending } = parseSort(sort);
        let query = supabase.from(table).select('*');
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        query = query.order(column, { ascending });
        if (limit) query = query.limit(limit);
        const { data, error } = await query;
        if (error) throwSupabaseError(error);
        return mapRows(data);
      });
    },
  };
}

export const db = {
  entities: {
    Certificate: makeEntity('certificates'),
    CertificateLog: makeEntity('certificate_logs'),
    Employee: makeEntity('employees'),
    FieldOffice: makeEntity('field_offices'),
    Signatory: makeEntity('signatories'),
    User: {
      async list() {
        return [];
      },
    },
  },
};
